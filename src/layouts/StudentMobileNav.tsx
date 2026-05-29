import { Search, PlusCircle, BookmarkCheck, FileText } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function StudentMobileNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  // Only show for students/logged in users
  if (!user) return null

  const tabs = [
    { to: "/gallery", icon: Search, label: "Browse" },
    { to: "/report-lost", icon: PlusCircle, label: "Report" },
    { to: "/my-claims", icon: BookmarkCheck, label: "Claims" },
    { to: "/my-reports", icon: FileText, label: "Reports" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.to || pathname.startsWith(tab.to + "/")
          const Icon = tab.icon
          
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative"
            >
              <div 
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full",
                  isActive ? "text-brand" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand rounded-b-full shadow-[0_2px_8px_rgba(14,165,233,0.4)]" />
                )}
                <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "")} />
                <span className={cn("text-[10px] mt-1 tracking-wide font-medium", isActive && "font-bold")}>
                  {tab.label}
                </span>
              </div>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
