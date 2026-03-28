import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Package, 
  FileSearch, 
  HandMetal, 
  History,
  Settings,
  LogOut,
  User,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Menu,
  ChevronLeft
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function AdminSidebar() {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside style={{ 
      width: isCollapsed ? '5rem' : '18rem', 
      backgroundColor: '#1E2F85', 
      color: '#FFFFFF', 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '4px 0 10px -3px rgba(0, 0, 0, 0.1)', 
      zIndex: 50,
      height: '100%', 
      flexShrink: 0,
      transition: 'width 0.3s ease-in-out'
    }}>
      {/* Branding */}
      <div style={{ padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', gap: '0.75rem' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>
              ReClaim<span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Admin</span>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            padding: '0.5rem', 
            color: 'rgba(255, 255, 255, 0.9)', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '0.5rem', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isCollapsed ? <Menu style={{ width: '1.25rem', height: '1.25rem' }} /> : <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} />}
        </button>
      </div>

      {/* Navigation */}
      <nav 
        className="sidebar-nav-container"
        style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: isCollapsed ? '1.5rem' : '2rem', overflowY: 'auto', overflowX: 'hidden' }}
      >
        <style>{`
          .sidebar-nav-container::-webkit-scrollbar {
            display: none;
          }
          .sidebar-nav-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        
        {/* Group: Core Operations */}
        <div>
          {!isCollapsed && <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>Action Queue</h4>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '0.75rem' : '0.25rem' }}>
            <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard style={{ width: '1.125rem', height: '1.125rem' }} />} label="Dashboard" isCollapsed={isCollapsed} />
            <SidebarItem to="/admin/inventory" icon={<Package style={{ width: '1.125rem', height: '1.125rem' }} />} label="Inventory" isCollapsed={isCollapsed} />
            <SidebarItem to="/admin/reports" icon={<FileSearch style={{ width: '1.125rem', height: '1.125rem' }} />} label="Missing Items" isCollapsed={isCollapsed} />
            <SidebarItem to="/admin/claims" icon={<HandMetal style={{ width: '1.125rem', height: '1.125rem' }} />} label="Claims Verification" isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Group: Records */}
        <div>
          {!isCollapsed && <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>Accountability</h4>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '0.75rem' : '0.25rem' }}>
            <SidebarItem to="/admin/handover-log" icon={<History style={{ width: '1.125rem', height: '1.125rem' }} />} label="Handover Log" isCollapsed={isCollapsed} />
            <SidebarItem to="/admin/user-directory" icon={<User style={{ width: '1.125rem', height: '1.125rem' }} />} label="User Directory" isCollapsed={isCollapsed} />
            <SidebarItem to="/admin/expired-inventory" icon={<Package style={{ width: '1.125rem', height: '1.125rem' }} />} label="Expired Items" isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Group: AI Monitoring */}
        <div>
          {!isCollapsed && <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>AI Monitoring</h4>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '0.75rem' : '0.25rem' }}>
            <SidebarItem to="/admin/cameras" icon={<Camera style={{ width: '1.125rem', height: '1.125rem' }} />} label="CCTV Dashboard" isCollapsed={isCollapsed} />
            <SidebarItem to="/admin/snapshots" icon={<ImageIcon style={{ width: '1.125rem', height: '1.125rem' }} />} label="Snapshot Gallery" isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Group: System */}
        <div>
          {!isCollapsed && <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>System</h4>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '0.75rem' : '0.25rem' }}>
            <SidebarItem to="/admin/logs" icon={<History style={{ width: '1.125rem', height: '1.125rem' }} />} label="Audit Archive" isCollapsed={isCollapsed} />
            <SidebarItem to="/admin/settings" icon={<Settings style={{ width: '1.125rem', height: '1.125rem' }} />} label="Settings" isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>

      <div style={{ padding: isCollapsed ? '1rem' : '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.4)' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <ShieldCheck style={{ width: '0.75rem', height: '0.75rem' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Administrator</span>
              </div>
            </div>
          </div>
        )}

        <SidebarItem 
          to="/"
          icon={<LogOut style={{ width: '1.125rem', height: '1.125rem' }} />}
          label="Exit to Portal"
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  )
}

function SidebarItem({ to, icon, label, isCollapsed }: { to: string, icon: React.ReactNode, label: string, isCollapsed: boolean }) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  const link = (
    <NavLink 
      to={to} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '0.75rem', 
        padding: '0.75rem', 
        borderRadius: '0.75rem', 
        fontSize: '0.875rem', 
        fontWeight: isActive ? 700 : 500, 
        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)', 
        textDecoration: 'none',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        boxShadow: isActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>{icon}</div>
      {!isCollapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
    </NavLink>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {link}
        </TooltipTrigger>
        <TooltipContent side="right" style={{ backgroundColor: '#1E2F85', color: '#FFFFFF', fontWeight: '600', border: '1px solid #1E2F85', marginLeft: '0.5rem' }}>
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}
