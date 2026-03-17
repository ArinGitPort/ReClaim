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
        setNotifications([])
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
