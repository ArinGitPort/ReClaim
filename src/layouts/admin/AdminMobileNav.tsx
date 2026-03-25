import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  X, 
  Menu,
  LayoutDashboard, 
  Package, 
  FileSearch, 
  HandMetal, 
  History,
  LogOut
} from "lucide-react"

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { pathname } = useLocation()

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 60, 
      width: '100%', 
      backgroundColor: '#FFFFFF', 
      borderBottom: '1px solid #E2E8F0', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      display: 'none', // Effectively hidden on large screens via CSS, but we use styles for consistency.
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem', padding: '0 1rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: '#0F172A' }}>
          <span style={{ color: '#1E2F85' }}>Admin</span>Portal
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ padding: '0.5rem', marginRight: '-0.5rem', color: '#64748B', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X style={{ width: '1.5rem', height: '1.5rem' }} /> : <Menu style={{ width: '1.5rem', height: '1.5rem' }} />}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{ position: 'absolute', top: '4rem', left: 0, width: '100%', backgroundColor: '#1E2F85', borderBottom: '1px solid #172363', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem', padding: '0 0.75rem', marginTop: '0.5rem' }}>Action Queue</h4>
            <MobileNavItem to="/admin/dashboard" icon={<LayoutDashboard style={{ width: '1.25rem', height: '1.25rem' }} />} label="Dashboard" />
            <MobileNavItem to="/admin/inventory" icon={<Package style={{ width: '1.25rem', height: '1.25rem' }} />} label="Inventory" />
            <MobileNavItem to="/admin/reports" icon={<FileSearch style={{ width: '1.25rem', height: '1.25rem' }} />} label="Missing Items" />
            <MobileNavItem to="/admin/claims" icon={<HandMetal style={{ width: '1.25rem', height: '1.25rem' }} />} label="Claims Verification" />
            
            <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.75rem 0' }} />
            <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem', padding: '0 0.75rem' }}>Records & Accountability</h4>
            <MobileNavItem to="/admin/handover-log" icon={<History style={{ width: '1.25rem', height: '1.25rem' }} />} label="Handover Log" />
            <MobileNavItem to="/admin/user-directory" icon={<FileSearch style={{ width: '1.25rem', height: '1.25rem' }} />} label="User Directory" />
            <MobileNavItem to="/admin/expired-inventory" icon={<Package style={{ width: '1.25rem', height: '1.25rem' }} />} label="Expired Inventory" />

            <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.75rem 0' }} />
            <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem', padding: '0 0.75rem' }}>System Administration</h4>
            <MobileNavItem to="/admin/logs" icon={<History style={{ width: '1.25rem', height: '1.25rem' }} />} label="Audit Archive" />
            <MobileNavItem to="/admin/settings" icon={<LayoutDashboard style={{ width: '1.25rem', height: '1.25rem' }} />} label="Settings" />
            
            <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.75rem 0' }} />
            <MobileNavItem to="/" icon={<LogOut style={{ width: '1.25rem', height: '1.25rem' }} />} label="Exit to Portal" variant="secondary" />
          </div>
        </div>
      )}
    </div>
  )
}

function MobileNavItem({ to, icon, label, variant = "default" }: { to: string, icon: React.ReactNode, label: string, variant?: "default" | "secondary" }) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    }

    if (variant === "secondary") {
      return {
        ...base,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 500
      }
    }

    if (isActive) {
      return {
        ...base,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        fontWeight: 600,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }
    }

    return {
      ...base,
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: 500
    }
  }

  return (
    <NavLink to={to} style={getStyle()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: isActive ? 'scale(1.05)' : 'scale(1)' }}>{icon}</div>
      <span style={{ fontSize: '1rem', flex: 1 }}>{label}</span>
    </NavLink>
  )
}
