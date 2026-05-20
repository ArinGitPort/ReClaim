import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Check, MessageSquare, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "@/contexts/NotificationContext"
import { cn } from "@/lib/utils"

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} mins ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

export function MessageNotificationsDropdown() {
  const { notifications, markRead, markAllReadByType } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isRightAligned, setIsRightAligned] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const unreadMessages = notifications.filter((notification) => (
    !notification.read && (notification.type === "CLAIM_MESSAGE" || notification.type === "REPORT_MESSAGE")
  ))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  useLayoutEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      if (rect.right > window.innerWidth - 16) {
        setIsRightAligned(true)
      } else if (dropdownRef.current) {
        const btnRect = dropdownRef.current.getBoundingClientRect()
        setIsRightAligned(window.innerWidth - btnRect.right < 190)
      }
    }
  }, [isOpen])

  if (unreadMessages.length === 0) {
    return null
  }

  function openNotification(notificationId: string, route: string) {
    markRead(notificationId)
    setIsOpen(false)
    navigate(route)
  }

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "relative inline-flex rounded-full p-2 transition-colors",
          isOpen ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-background-subtle hover:text-text-primary"
        )}
        aria-label="Unread messages"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="absolute -right-0 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background-app bg-brand px-1 text-[10px] font-bold text-white">
          {unreadMessages.length > 9 ? "9+" : unreadMessages.length}
        </span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] animate-in overflow-hidden rounded-xl border border-border-divider bg-background-app shadow-lg fade-in slide-in-from-top-2 duration-200",
            isRightAligned ? "right-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          <div className="flex items-center justify-between border-b border-border-divider bg-background-app px-4 py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Unread Messages</h3>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
              {unreadMessages.length} New
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto bg-background-app">
            {unreadMessages.map((notification, index) => (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "group relative flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-background-subtle/50",
                  index !== unreadMessages.length - 1 && "border-b border-border-divider/60"
                )}
                onClick={() => openNotification(notification.id, notification.route)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    openNotification(notification.id, notification.route)
                  }
                }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-brand/10 bg-brand/5 text-brand">
                  <MessageSquare className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1 pr-6 pt-0.5">
                  <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                  <p className="mt-0.5 truncate text-sm text-text-secondary">{notification.message}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-text-secondary/70">
                    <span>{timeAgo(notification.createdAt)}</span>
                    <span>{notification.type === "REPORT_MESSAGE" ? "Report chat" : "Claim chat"}</span>
                  </div>
                </div>

                <div className="absolute right-4 top-4 flex h-full flex-col items-end">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-brand group-hover:hidden" />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      markRead(notification.id)
                    }}
                    className="hidden rounded-md p-1 text-text-secondary transition-all hover:bg-background-subtle hover:text-text-primary group-hover:flex -mr-1 -mt-1"
                    title="Mark as read"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center border-t border-border-divider bg-background-app/50 p-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                markAllReadByType("CLAIM_MESSAGE")
                markAllReadByType("REPORT_MESSAGE")
                setIsOpen(false)
              }}
              className="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-background-subtle hover:text-text-primary"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
