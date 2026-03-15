import { ArrowLeft, Bell, User } from "lucide-react"
import { Link } from "react-router-dom"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/features/auth/AuthContext"

interface TopNavBarProps {
  title?: string
  backLink?: string
  backLabel?: string
}

export function TopNavBar({ 
  title = "Campus Lost & Found", 
  backLink = "/", 
  backLabel = "Back" 
}: TopNavBarProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={backLink} className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-semibold group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {backLabel}
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden md:block">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <button className="relative p-2 text-slate-500 hover:text-brand hover:bg-brand/10 rounded-full transition-all group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 leading-none">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">Student Account</span>
            </div>
            <button className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-brand hover:border-brand/40 transition-all">
              <User className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden md:flex ml-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
