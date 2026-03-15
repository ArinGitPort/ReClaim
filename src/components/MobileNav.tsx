import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Menu,
  X,
  Search, 
  PlusCircle, 
  Hand, 
  FileText, 
  Settings, 
  MapPin, 
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when route changes
  const { pathname } = useLocation()
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className="md:hidden sticky top-0 z-[60] w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="font-extrabold text-xl tracking-tight text-slate-900">
          <span className="text-[#263da8]">Re</span>Claim
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-slate-500 hover:text-[#263da8] transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#1E2F85] border-b border-[#172363] shadow-lg flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 flex flex-col gap-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 px-3 mt-2">Core Actions</h4>
            
            <MobileNavItem to="/gallery" icon={<Search className="w-5 h-5" />} label="Browse Found Items" />
            <MobileNavItem to="/report-lost" icon={<PlusCircle className="w-5 h-5" />} label="Report a Lost Item" />
            
            <div className="h-px w-full bg-white/10 my-3" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 px-3">Tracking & Status</h4>
            
            <MobileNavItem to="/my-claims" icon={<Hand className="w-5 h-5" />} label="My Claims" />
            <MobileNavItem to="/my-reports" icon={<FileText className="w-5 h-5" />} label="My Lost Reports" />

            <div className="h-px w-full bg-white/10 my-3" />
            
            <MobileNavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Profile Settings" />
            <MobileNavItem to="/office" icon={<MapPin className="w-5 h-5" />} label="Campus Admin Office" />
            <MobileNavItem to="/" icon={<LogOut className="w-5 h-5" />} label="Log Out" variant="danger" />
          </div>
        </div>
      )}
    </div>
  )
}

function MobileNavItem({ to, icon, label, variant = "default" }: { to: string, icon: React.ReactNode, label: string, variant?: "default" | "danger" }) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  return (
    <NavLink 
      to={to}
      className={cn(
        "flex flex-row items-center gap-3 px-3 py-3 rounded-lg transition-all",
        variant === "danger" 
          ? "text-white/60 hover:bg-rose-500/20 hover:text-rose-200" 
          : isActive
            ? "bg-white/10 text-white font-semibold shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white font-medium"
      )}
    >
      {icon}
      <span className="text-base flex-1">{label}</span>
    </NavLink>
  )
}
