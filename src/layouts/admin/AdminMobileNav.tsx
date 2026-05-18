import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { 
  X, 
  Menu,
  LayoutDashboard, 
  Package, 
  FileSearch, 
  HandMetal, 
  History,
  LogOut,
  Camera,
  Video,
  Activity,
  ArchiveRestore
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (logout) logout()
    navigate("/")
    setIsOpen(false)
  }

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className="md:hidden sticky top-0 z-[60] w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="font-extrabold text-xl tracking-tight text-slate-900">
          <span className="text-brand">Admin</span>Portal
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-slate-500 hover:text-brand transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#1E2F85] border-b border-[#172363] shadow-lg flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 flex flex-col gap-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 px-3 mt-2">Operations</h4>
            <MobileNavItem to="/admin/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="System Dashboard" />
            <MobileNavItem to="/admin/inventory" icon={<Package className="w-5 h-5" />} label="Inventory Management" />
            <MobileNavItem to="/admin/reports" icon={<FileSearch className="w-5 h-5" />} label="Missing Items" />
            <MobileNavItem to="/admin/claims" icon={<HandMetal className="w-5 h-5" />} label="Claims Verification" />
            <MobileNavItem to="/admin/live-monitor" icon={<Activity className="w-5 h-5" />} label="Live Monitor" />

            <div className="h-px w-full bg-white/10 my-3" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 px-3">AI Intake</h4>
            <MobileNavItem to="/admin/snapshots" icon={<Camera className="w-5 h-5" />} label="AI Snapshot Gallery" />
            <MobileNavItem to="/admin/dismissed-snapshots" icon={<ArchiveRestore className="w-5 h-5" />} label="Dismissed Snapshots" />
            
            <div className="h-px w-full bg-white/10 my-3" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 px-3">Records & Accountability</h4>
            <MobileNavItem to="/admin/handover-log" icon={<History className="w-5 h-5" />} label="Handover Log" />
            <MobileNavItem to="/admin/user-directory" icon={<FileSearch className="w-5 h-5" />} label="User Directory" />
            <MobileNavItem to="/admin/deleted-items" icon={<Package className="w-5 h-5" />} label="Deleted Items" />

            <div className="h-px w-full bg-white/10 my-3" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 px-3">System Administration</h4>
            <MobileNavItem to="/admin/logs" icon={<History className="w-5 h-5" />} label="Audit Trail" />
            <MobileNavItem to="/admin/camera-settings" icon={<Video className="w-5 h-5" />} label="Camera Settings" />
            <MobileNavItem to="/admin/settings" icon={<LayoutDashboard className="w-5 h-5" />} label="System Settings" />
            
            <div className="h-px w-full bg-white/10 my-3" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-white/60 hover:bg-rose-500/20 hover:text-rose-200 w-full text-left font-medium"
            >
              <div className="transition-transform"><LogOut className="w-5 h-5" /></div>
              <span className="text-base flex-1">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileNavItem({ to, icon, label, variant = "default" }: { to: string, icon: React.ReactNode, label: string, variant?: "default" | "secondary" }) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  return (
    <NavLink 
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
        variant === "secondary"
          ? "text-white/60 hover:bg-rose-500/20 hover:text-rose-200"
          : isActive
            ? "bg-white/10 text-white font-semibold shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white font-medium"
      )}
    >
      <div className={cn("transition-transform", isActive && "scale-105")}>{icon}</div>
      <span className="text-base flex-1">{label}</span>
    </NavLink>
  )
}
