import { Bell, CheckCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { TopNavBar } from "@/layouts/TopNavBar"
import { useNotifications } from "@/contexts/NotificationContext"

export function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()

  return (
    <div className="w-full min-h-full pb-24">
      <TopNavBar title="Notifications" backLink="/gallery" backLabel="Back" />

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Realtime Updates</h2>
            <p className="text-slate-500 text-sm">All system alerts and report status changes appear here.</p>
          </div>
          <button
            onClick={markAllRead}
            className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50"
          >
            <CheckCheck className="w-4 h-4 inline mr-2" /> Mark all read
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">
          Unread notifications: {unreadCount}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No notifications yet.</p>
            </div>
          )}

          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 ${item.read ? "bg-white border-slate-200" : "bg-brand/5 border-brand/20"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">{item.message}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={item.route}
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
      </main>
    </div>
  )
}
