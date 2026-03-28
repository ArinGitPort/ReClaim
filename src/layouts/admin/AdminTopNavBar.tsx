import { User, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "@/layouts/ThemeToggle"
import { NotificationDropdown } from "@/layouts/NotificationDropdown"

export function AdminTopNavBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  // Derive title from pathname
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'System Dashboard'
    if (pathname.includes('/inventory')) return 'Inventory Management'
    if (pathname.includes('/reports')) return 'Missing Items'
    if (pathname.includes('/claims')) return 'Claims Verification'
    if (pathname.includes('/handover-log')) return 'Handover Log'
    if (pathname.includes('/user-directory')) return 'User Directory'
    if (pathname.includes('/expired-inventory')) return 'Expired Inventory'
    if (pathname.includes('/logs')) return 'Audit Archive'
    if (pathname.includes('/settings')) return 'System Settings'
    return 'Admin Portal'
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side: Navigation Info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-semibold group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Site
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden md:block">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Side: Account & Notifications */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <NotificationDropdown adminMode={true} />
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-xs font-bold text-slate-900 leading-none">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-1">Administrator</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand hover:border-brand/40 transition-all">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="hidden md:flex ml-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
