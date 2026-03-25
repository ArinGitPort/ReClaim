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
  ChevronLeft,
  User
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const asideStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: '#1E2F85',
    borderRight: '1px solid rgba(0, 0, 0, 0.2)',
    flexDirection: 'column',
    zIndex: 20,
    position: 'sticky',
    top: 0,
    height: '100vh',
    width: isCollapsed ? '5rem' : '16rem',
    transition: 'width 0.3s ease-in-out'
  }

  return (
    <aside style={asideStyle}>
      {/* App Title Header */}
      <div style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', flexShrink: 0, overflow: 'hidden', marginTop: '0.5rem' }}>
        {!isCollapsed && (
          <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: '#FFFFFF', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Re</span>Claim
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            padding: '0.5rem', 
            color: 'rgba(255, 255, 255, 0.9)', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '0.5rem', 
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            margin: isCollapsed ? '0 auto' : '0'
          }}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <Menu style={{ width: '1.25rem', height: '1.25rem' }} /> : <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} />}
        </button>
      </div>

      {/* Main Navigation Area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        
        <div style={{ marginBottom: '0.5rem', padding: '0 0.75rem' }}>
          {!isCollapsed && <h4 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>Core Actions</h4>}
        </div>

        <SidebarItem 
          to="/gallery" 
          icon={<Search style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="Browse Found Items" 
          isCollapsed={isCollapsed} 
        />
        
        <SidebarItem 
          to="/report-lost" 
          icon={<PlusCircle style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="Report a Lost Item" 
          isCollapsed={isCollapsed} 
        />

        <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', padding: '0 0.75rem' }}>
          {!isCollapsed && <h4 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>Tracking & Status</h4>}
          {isCollapsed && <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem 0' }} />}
        </div>

        <SidebarItem 
          to="/ready-to-claim" 
          icon={<Ticket style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="Ready to Claim" 
          isCollapsed={isCollapsed} 
        />

        <SidebarItem 
          to="/my-claims" 
          icon={<Hand style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="My Claims" 
          isCollapsed={isCollapsed} 
        />

        <SidebarItem 
          to="/my-reports" 
          icon={<FileText style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="My Lost Reports" 
          isCollapsed={isCollapsed} 
        />

      </div>

      {/* Bottom Navigation Area */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0, overflowX: 'hidden' }}>
        <SidebarItem 
          to="/office" 
          icon={<MapPin style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="Campus Admin Office" 
          isCollapsed={isCollapsed} 
        />
        <SidebarItem 
          to="/profile" 
          icon={<User style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="My Profile" 
          isCollapsed={isCollapsed} 
        />
        <SidebarItem 
          to="/settings" 
          icon={<Settings style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
          label="Settings" 
          isCollapsed={isCollapsed} 
        />
        <SidebarItem 
          to="/" 
          icon={<LogOut style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />} 
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

  const getLinkStyles = (active: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.625rem 0.75rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      position: 'relative',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      transition: 'all 0.2s'
    }

    if (variant === "danger") {
      return { ...base, color: 'rgba(255, 255, 255, 0.6)' }
    }

    if (active) {
      return { ...base, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontWeight: '600', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }
    }

    return { ...base, color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }
  }

  const navLink = (
    <NavLink 
      to={to}
      style={({ isActive: linkActive }) => getLinkStyles(isActive || linkActive)}
    >
      <div style={{ color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      
      {!isCollapsed && (
        <span style={{ fontSize: '0.875rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
      )}
    </NavLink>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {navLink}
        </TooltipTrigger>
        <TooltipContent side="right" style={{ backgroundColor: '#1E2F85', color: '#FFFFFF', fontWeight: '600', border: '1px solid #1E2F85', marginLeft: '0.5rem', outline: 'none' }}>
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return navLink
}
