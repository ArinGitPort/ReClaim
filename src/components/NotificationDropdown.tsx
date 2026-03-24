import { Bell, CheckCheck } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNotifications, type AppNotification } from "@/contexts/NotificationContext"

export function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  
  const viewAllRoute = pathname.startsWith("/admin") ? "/admin/notifications" : "/notifications"
  const recentNotifications = notifications.slice(0, 5) // Render top 5 max over dropdown

  const handleOpen = (item: AppNotification) => {
    markRead(item.id)
    navigate(item.route)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 focus:outline-none">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1.5 flex h-4 w-4 shrink-0 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0 rounded-xl overflow-hidden shadow-xl border-slate-200 bg-white">
        <div className="bg-slate-50/70 p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold tracking-tight text-slate-900">Push Alerts</h3>
            {unreadCount > 0 && (
              <span className="bg-[#1E2F85]/10 text-[#1E2F85] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-[10px] font-bold text-slate-500 hover:text-[#1E2F85] transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" /> Read All
            </button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <p className="p-6 text-center text-sm font-medium text-slate-500">You're completely caught up!</p>
          ) : (
            <div className="flex flex-col">
              {recentNotifications.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleOpen(item)}
                  className={`flex flex-col items-start px-4 py-3 text-left border-b border-slate-50 transition-colors hover:bg-slate-50 ${!item.read ? 'bg-[#1E2F85]/[0.03]' : ''}`}
                >
                  <p className={`text-sm tracking-tight ${!item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">{item.message}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-slate-100 bg-slate-50/70">
          <button 
             onClick={() => navigate(viewAllRoute)} 
             className="w-full py-2.5 text-xs font-bold text-[#1E2F85] hover:text-white hover:bg-[#1E2F85] rounded-lg transition-colors text-center uppercase tracking-widest"
          >
            View All Notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
