import { Bell, CheckCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { type AppNotification, useNotifications } from "@/contexts/NotificationContext"

export function AdminNotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Notifications</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Realtime operational alerts for admin workflows.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E2E8F0', padding: '1rem' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', margin: 0 }}>Unread notifications: {unreadCount}</p>
        <button
          onClick={markAllRead}
          style={{ height: '2.25rem', padding: '0 1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <CheckCheck style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Mark all read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.length === 0 && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
            <Bell style={{ width: '2rem', height: '2rem', color: '#CBD5E1', marginLeft: 'auto', marginRight: 'auto', marginBottom: '0.75rem' }} />
            <p style={{ color: '#64748B', fontWeight: 600, margin: 0 }}>No notifications yet.</p>
          </div>
        )}

        {notifications.map((item) => (
          <div
            key={item.id}
            style={{
              borderRadius: '1rem',
              border: '1px solid',
              padding: '1.25rem',
              backgroundColor: item.read ? '#FFFFFF' : 'rgba(30, 47, 133, 0.05)',
              borderColor: item.read ? '#E2E8F0' : 'rgba(30, 47, 133, 0.2)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>{item.message}</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link
                    to={buildNotificationOpenRoute(item)}
                    onClick={() => markRead(item.id)}
                    style={{ height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Open
                  </Link>
                  {!item.read && (
                    <button
                      onClick={() => markRead(item.id)}
                      style={{ height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1E2F85', color: '#FFFFFF', border: 'none', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
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
