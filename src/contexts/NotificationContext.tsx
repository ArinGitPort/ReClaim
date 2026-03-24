/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { useAuth } from "@/contexts/AuthContext"

type RealtimeNotificationEvent = {
  id: string
  title: string
  message: string
  route?: string | null
  createdAt: string
  readAt?: string | null
}

export type AppNotification = {
  id: string
  title: string
  message: string
  route: string
  createdAt: string
  read: boolean
}

type NotificationContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

function mapNotification(input: {
  id: string
  title: string
  message: string
  route?: string | null
  createdAt: string
  readAt?: string | null
}): AppNotification {
  return {
    id: input.id,
    title: input.title,
    message: input.message,
    route: input.route ?? "/notifications",
    createdAt: input.createdAt,
    read: Boolean(input.readAt),
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    async function loadNotifications(): Promise<void> {
      if (!user) {
        setNotifications([])
        return
      }

      try {
        const response = await api.get<{
          notifications: Array<{
            id: string
            title: string
            message: string
            route?: string | null
            createdAt: string
            readAt?: string | null
          }>
        }>("/notifications")

        setNotifications(response.data.notifications.map(mapNotification))
      } catch {
        const adminMocks = [
          {
            id: "notif-1",
            title: "New AI Match: Apple AirPods",
            message: "A high-confidence match for claim CLM-8911 has been logged by Camera 02 at the Library Entrance. Review immediately.",
            route: "/admin/verification?focus=CLM-8911",
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            readAt: null
          },
          {
            id: "notif-3",
            title: "System Reminder",
            message: "Remember to continually check your active claims menu for real-time updates regarding your missing items.",
            route: "/claims",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            readAt: null
          },
          {
            id: "notif-4",
            title: "Item Expiration Imminent",
            message: "Found Item #INV-4901 is approaching the 30-day retention limit. Tagged for standard donation protocol.",
            route: "/admin/inventory",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            readAt: new Date().toISOString()
          }
        ];
        
        const userMocks = [
          {
            id: "notif-2",
            title: "Claim Approved",
            message: "Your ownership claim (CLM-8812) has been fully verified! You may now retrieve your item from the main campus Admin Office.",
            route: "/claims",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            readAt: null
          },
          {
            id: "notif-5",
            title: "Lost Report Tracked",
            message: "We have officially documented your lost report for the MacBook Pro. AI cameras have been flagged.",
            route: "/reports",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            readAt: new Date().toISOString()
          }
        ];

        setNotifications((user.role === "ADMIN" ? adminMocks : userMocks).map(mapNotification))
      }
    }

    void loadNotifications()
  }, [user])

  useEffect(() => {
    if (!user) {
      return
    }

    const socket = getRealtimeSocket()
    if (!socket) {
      return
    }

    const handleNotificationCreated = (event: RealtimeNotificationEvent) => {
      setNotifications((prev) => [mapNotification(event), ...prev].slice(0, 100))
    }

    socket.on("notification.created", handleNotificationCreated)
    return () => {
      socket.off("notification.created", handleNotificationCreated)
    }
  }, [user])

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => (item.read ? count : count + 1), 0),
    [notifications]
  )

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAllRead: () => {
        void api.patch("/notifications/read-all")
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
      },
      markRead: (id: string) => {
        void api.patch(`/notifications/${id}/read`)
        setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
      },
    }),
    [notifications, unreadCount]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
