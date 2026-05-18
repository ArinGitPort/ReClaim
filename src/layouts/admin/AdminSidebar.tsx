import React, { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  Package, 
  FileSearch, 
  HandMetal, 
  History,
  Users,
  Archive,
  ArchiveRestore,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  ChevronLeft,
  Camera,
  Video,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (logout) logout()
    navigate("/")
  }
  
  return (
    <aside 
      className={cn(
        "hidden md:flex bg-[#1E2F85] border-r border-[#172363] flex-col transition-[width] duration-300 ease-in-out z-20 sticky top-0 h-screen",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Admin Title Header */}
      <div className="h-16 flex items-center justify-between px-4 flex-shrink-0 overflow-hidden mt-2">
        {!isCollapsed && (
          <div className="font-extrabold text-xl tracking-tight text-white overflow-hidden whitespace-nowrap">
            <span className="text-white/60">Admin</span>Portal
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 text-white bg-white/10 hover:bg-white/20 transition-all rounded-lg shadow-sm border border-white/10 hover:border-white/30 active:scale-95",
            isCollapsed && "mx-auto"
          )}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 flex flex-col gap-1">
        <div className="mb-2 px-3">
          {!isCollapsed && <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Action Queue</h4>}
          {isCollapsed && <div className="h-px w-full bg-white/10 my-2" />}
        </div>

        <AdminSidebarItem to="/admin/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="System Dashboard" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/live-monitor" icon={<Activity className="w-5 h-5" />} label="Live Monitor" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/inventory" icon={<Package className="w-5 h-5" />} label="Inventory Management" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/reports" icon={<FileSearch className="w-5 h-5" />} label="Missing Items" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/snapshots" icon={<Camera className="w-5 h-5" />} label="AI Snapshot Gallery" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/claims" icon={<HandMetal className="w-5 h-5" />} label="Claims Verification" isCollapsed={isCollapsed} />

        <div className="mt-6 mb-2 px-3">
          {!isCollapsed && <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Records & Accountability</h4>}
          {isCollapsed && <div className="h-px w-full bg-white/10 my-2" />}
        </div>

        <AdminSidebarItem to="/admin/handover-log" icon={<History className="w-5 h-5" />} label="Handover Log" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/user-directory" icon={<Users className="w-5 h-5" />} label="User Directory" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/expired-inventory" icon={<Archive className="w-5 h-5" />} label="Expired Inventory" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/dismissed-snapshots" icon={<ArchiveRestore className="w-5 h-5" />} label="Dismissed Snapshots" isCollapsed={isCollapsed} />

        <div className="mt-6 mb-2 px-3">
          {!isCollapsed && <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">System Administration</h4>}
          {isCollapsed && <div className="h-px w-full bg-white/10 my-2" />}
        </div>

        <AdminSidebarItem to="/admin/logs" icon={<History className="w-5 h-5" />} label="Audit Trail" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/camera-settings" icon={<Video className="w-5 h-5" />} label="Camera Settings" isCollapsed={isCollapsed} />
        <AdminSidebarItem to="/admin/settings" icon={<SettingsIcon className="w-5 h-5" />} label="System Settings" isCollapsed={isCollapsed} />
      </div>

      {/* Footer Area */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            "flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
            isCollapsed ? "justify-center" : "justify-start",
            "text-white/60 hover:bg-rose-500/20 hover:text-rose-200 w-full text-left"
          )}
          title={isCollapsed ? "Log Out" : undefined}
        >
          <div className="flex-shrink-0 transition-transform group-hover:scale-110 text-white/70 group-hover:text-white">
            <LogOut className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis tracking-tight font-medium">Log Out</span>
          )}
        </button>
      </div>
    </aside>
  )
}

interface AdminSidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isCollapsed: boolean
  variant?: "default" | "secondary"
}

function AdminSidebarItem({ to, icon, label, isCollapsed, variant = "default" }: AdminSidebarItemProps) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  return (
    <NavLink 
      to={to}
      className={cn(
        "flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
        isCollapsed ? "justify-center" : "justify-start",
        variant === "secondary"
          ? "text-white/60 hover:bg-rose-500/20 hover:text-rose-200"
          : isActive
            ? "bg-white/10 text-white font-semibold shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white font-medium"
      )}
      title={isCollapsed ? label : undefined}
    >
      <div className={cn(
        "flex-shrink-0 transition-transform group-hover:scale-110",
        isActive ? "text-white" : "text-white/70 group-hover:text-white"
      )}>
        {icon}
      </div>
      
      {!isCollapsed && (
        <span className="text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">
          {label}
        </span>
      )}

      {/* Hover Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
          {label}
        </div>
      )}
    </NavLink>
  )
}
