import { Bell, CheckCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { TopNavBar } from "@/layouts/TopNavBar"
import { type AppNotification, useNotifications } from "@/contexts/NotificationContext"

export function UserNotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '6rem', backgroundColor: '#F8FAFC' }}>
      <TopNavBar title="Notifications" backLink="/gallery" backLabel="Back" />

      <main style={{ maxWidth: '64rem', margin: '2rem auto 0', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Realtime Updates</h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>All system alerts and report status changes appear here.</p>
          </div>
          <button
            onClick={markAllRead}
            style={{ height: '2.5rem', padding: '0 1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <CheckCheck style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Mark all read
          </button>
        </div>

        <div style={{ borderRadius: '1rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '1.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          Unread notifications: {unreadCount}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.length === 0 && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
              <Bell style={{ width: '2rem', height: '2rem', color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#64748B', fontWeight: 600, margin: 0 }}>No notifications yet.</p>
            </div>
          )}

          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: '1rem',
                border: item.read ? '1px solid #E2E8F0' : '1px solid rgba(30, 47, 133, 0.2)',
                padding: '1.25rem',
                backgroundColor: item.read ? '#FFFFFF' : 'rgba(30, 47, 133, 0.05)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>{item.message}</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link
                    to={buildNotificationOpenRoute(item)}
                    onClick={() => markRead(item.id)}
                    style={{ height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Open
                  </Link>
                  {!item.read && (
                    <button
                      onClick={() => markRead(item.id)}
                      style={{ height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1E2F85', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}
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
