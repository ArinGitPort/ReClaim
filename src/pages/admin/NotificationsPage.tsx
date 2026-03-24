import { Bell, CheckCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { type AppNotification, useNotifications } from "@/contexts/NotificationContext"

export function AdminNotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Realtime operational alerts for admin workflows.</p>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-600">Unread notifications: {unreadCount}</p>
        <button
          onClick={markAllRead}
          className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50"
        >
          <CheckCheck className="w-4 h-4 inline mr-2" /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No notifications yet.</p>
          </div>
        )}

        {notifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border p-5 ${item.read ? "bg-white border-slate-200" : "bg-brand/5 border-brand/20"}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                <p className="text-sm font-medium text-slate-600 mt-1">{item.message}</p>
                <p className="text-xs font-semibold text-slate-400 mt-2">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={buildNotificationOpenRoute(item)}
                  onClick={() => markRead(item.id)}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 inline-flex items-center"
                >
                  Open
                </Link>
                {!item.read && (
                  <button
                    onClick={() => markRead(item.id)}
                    className="h-9 px-3 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildNotificationOpenRoute(item: AppNotification): string {
  const codeMatch = `${item.title} ${item.message}`.match(/\b([A-Z]{3}-\d+)\b/i)
  if (!codeMatch) {
    return item.route
  }

  const [path, query = ""] = item.route.split("?")
  const params = new URLSearchParams(query)
  params.set("focus", codeMatch[1].toUpperCase())

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}
