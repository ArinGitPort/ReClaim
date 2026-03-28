import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { Bell, X, Check } from "lucide-react"
import { useNotifications } from "@/contexts/NotificationContext"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return + minutes + " Mins ago"
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return + hours + " hours ago"
  const days = Math.floor(hours / 24)
  return + days + " days ago"
}

export function NotificationDropdown({ adminMode = false }: { adminMode?: boolean }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isRightAligned, setIsRightAligned] = useState(false)
  const navigate = useNavigate()

  const notificationsPath = adminMode ? "/admin/notifications" : "/notifications"

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
      } else {
        if (dropdownRef.current) {
          const btnRect = dropdownRef.current.getBoundingClientRect()
          const spaceNeeded = 380 / 2 // max width is 380px 
          if (window.innerWidth - btnRect.right < spaceNeeded) {
            setIsRightAligned(true)
          } else {
            setIsRightAligned(false)
          }
        }
      }
    }
  }, [isOpen])

  // Filter to only show unread (new) notifications
  const unreadNotifications = notifications.filter(n => !n.read)

  const handleToggle = () => {
    // If mobile screen, redirect directly rather than opening dropdown
    if (window.innerWidth < 768) {
      navigate(notificationsPath)
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className={cn(
          "relative p-2 rounded-full transition-colors inline-flex",
          isOpen ? "bg-brand/10 text-brand" : "text-text-secondary hover:text-text-primary hover:bg-background-subtle"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-0 min-w-5 h-5 px-1 bg-status-error border-2 border-background-app rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className={cn(
            "absolute top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-background-app rounded-xl shadow-lg border border-border-divider overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200",
            isRightAligned ? "right-0" : "left-1/2 -translate-x-1/2"
          )}
        >

          {/* Header */}
          <div className="px-4 py-4 border-b border-border-divider flex items-center justify-between bg-background-app">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="bg-brand/10 text-brand text-[11px] px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} New
                </span>
              )}
              <Link
                to={notificationsPath}
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-brand hover:text-brand-dark hover:underline transition-all"
              >
                View all
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto bg-background-app">
            {unreadNotifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-text-secondary text-sm">
                No new notifications.
              </div>
            ) : (
              unreadNotifications.map((notif, index) => (
                <div 
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-background-subtle/50 transition-colors group relative cursor-pointer",
                    index !== unreadNotifications.length - 1 && "border-b border-border-divider/60"
                  )}
                  onClick={() => {
                    markRead(notif.id)
                    if (notif.route) {
                      navigate(notif.route)
                      setIsOpen(false)
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center flex-shrink-0 text-brand">
                    <Bell className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-6 pt-0.5">
                    <p className="text-sm font-medium text-text-primary">
                      {notif.title}
                    </p>
                    <p className="text-sm text-text-secondary mt-0.5 truncate">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-medium text-text-secondary/70">
                      <span>{timeAgo(notif.createdAt)}</span>
                      <span>System alert</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 h-full flex flex-col items-end">
                    <span className="w-2 h-2 rounded-full bg-brand mt-1.5 group-hover:hidden" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(notif.id);
                      }}
                      className="hidden group-hover:flex p-1 text-text-secondary hover:text-text-primary transition-all rounded-md hover:bg-background-subtle -mt-1 -mr-1"
                      title="Mark as read"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer Action */}
          {unreadNotifications.length > 0 && (
            <div className="p-3 border-t border-border-divider bg-background-app/50 backdrop-blur-sm flex justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllRead();
                  setIsOpen(false);
                }}
                className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md transition-colors flex items-center gap-2 hover:bg-background-subtle"
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
