import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Search, 
  PlusCircle, 
  Hand, 
  Ticket,
  FileText, 
  Settings, 
  MapPin, 
  LogOut,
  Menu,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <aside 
      className={cn(
        "hidden md:flex bg-[#1E2F85] border-r border-black/20 flex-col transition-[width] duration-300 ease-in-out z-20 sticky top-0 h-screen",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* App Title Header */}
      <div className="h-16 flex items-center justify-between px-4 flex-shrink-0 overflow-hidden mt-2">
        {!isCollapsed && (
          <div className="font-extrabold text-xl tracking-tight text-white overflow-hidden whitespace-nowrap">
            <span className="text-white/80">Re</span>Claim
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 text-white/90 bg-white/10 hover:bg-white/20 transition-all rounded-lg shadow-sm border border-white/10 hover:border-white/30 active:scale-95",
            isCollapsed && "mx-auto"
          )}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 flex flex-col gap-1">
        
        <div className="mb-2 px-3">
          {!isCollapsed && <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Core Actions</h4>}
        </div>

        <SidebarItem 
          to="/gallery" 
          icon={<Search className="w-5 h-5 flex-shrink-0" />} 
          label="Browse Found Items" 
          isCollapsed={isCollapsed} 
        />
        
        <SidebarItem 
          to="/report-lost" 
          icon={<PlusCircle className="w-5 h-5 flex-shrink-0" />} 
          label="Report a Lost Item" 
          isCollapsed={isCollapsed} 
        />

        <div className="mt-6 mb-2 px-3">
          {!isCollapsed && <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Tracking & Status</h4>}
          {isCollapsed && <div className="h-px w-full bg-white/10 my-2" />}
        </div>

        <SidebarItem 
          to="/my-claims" 
          icon={<Hand className="w-5 h-5 flex-shrink-0" />} 
          label="My Claims" 
          isCollapsed={isCollapsed} 
        />

        <SidebarItem 
          to="/ready-to-claim" 
          icon={<Ticket className="w-5 h-5 flex-shrink-0" />} 
          label="Ready to Claim" 
          isCollapsed={isCollapsed} 
        />

        <SidebarItem 
          to="/my-reports" 
          icon={<FileText className="w-5 h-5 flex-shrink-0" />} 
          label="My Lost Reports" 
          isCollapsed={isCollapsed} 
        />
      </div>

      {/* Bottom Navigation Area */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-1 flex-shrink-0 overflow-x-hidden">
        <SidebarItem 
          to="/settings" 
          icon={<Settings className="w-5 h-5 flex-shrink-0" />} 
          label="Profile Settings" 
          isCollapsed={isCollapsed} 
        />
        <SidebarItem 
          to="/office" 
          icon={<MapPin className="w-5 h-5 flex-shrink-0" />} 
          label="Campus Admin Office" 
          isCollapsed={isCollapsed} 
        />
        <SidebarItem 
          to="/" 
          icon={<LogOut className="w-5 h-5 flex-shrink-0" />} 
          label="Log Out" 
          isCollapsed={isCollapsed} 
          variant="danger"
        />
      </div>
    </aside>
  )
}

interface SidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isCollapsed: boolean
  variant?: "default" | "danger"
}

function SidebarItem({ to, icon, label, isCollapsed, variant = "default" }: SidebarItemProps) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  return (
    <NavLink 
      to={to}
      className={cn(
        "flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
        isCollapsed ? "justify-center" : "justify-start",
        variant === "danger" 
          ? "text-white/60 hover:bg-rose-500/20 hover:text-rose-200" 
          : isActive
            ? "bg-white/10 text-white font-semibold shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white font-medium"
      )}
      title={isCollapsed ? label : undefined}
    >
      <div className={cn(
        "transition-transform group-hover:scale-110",
        isActive ? "text-white" : "text-white/70 group-hover:text-white"
      )}>
        {icon}
      </div>
      
      {!isCollapsed && (
        <span className="text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </span>
      )}

      {/* Hover Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-text-primary text-background-app text-xs font-semibold rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
          {label}
        </div>
      )}
    </NavLink>
  )
}
