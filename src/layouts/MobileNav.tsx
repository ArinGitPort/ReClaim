import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Menu,
  X,
  Search, 
  PlusCircle, 
  Hand, 
  Ticket,
  FileText, 
  Settings, 
  MapPin, 
  User,
  LogOut
} from "lucide-react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when route changes
  const { pathname } = useLocation()
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 60,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  }

  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem', padding: '0 1rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: '#0F172A' }}>
          <span style={{ color: '#263da8' }}>Re</span>Claim
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
            <h4 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.5rem', padding: '0 0.75rem', marginTop: '0.5rem' }}>Core Actions</h4>
            
            <MobileNavItem to="/gallery" icon={<Search style={{ width: '1.25rem', height: '1.25rem' }} />} label="Browse Found Items" />
            <MobileNavItem to="/report-lost" icon={<PlusCircle style={{ width: '1.25rem', height: '1.25rem' }} />} label="Report a Lost Item" />
            
            <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.75rem 0' }} />
            <h4 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.5rem', padding: '0 0.75rem' }}>Tracking & Status</h4>
            
            <MobileNavItem to="/ready-to-claim" icon={<Ticket style={{ width: '1.25rem', height: '1.25rem' }} />} label="Ready to Claim" />
            <MobileNavItem to="/my-claims" icon={<Hand style={{ width: '1.25rem', height: '1.25rem' }} />} label="My Claims" />
            <MobileNavItem to="/my-reports" icon={<FileText style={{ width: '1.25rem', height: '1.25rem' }} />} label="My Lost Reports" />

            <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.75rem 0' }} />
            
            <MobileNavItem to="/office" icon={<MapPin style={{ width: '1.25rem', height: '1.25rem' }} />} label="Campus Admin Office" />
            <MobileNavItem to="/profile" icon={<User style={{ width: '1.25rem', height: '1.25rem' }} />} label="My Profile" />
            <MobileNavItem to="/settings" icon={<Settings style={{ width: '1.25rem', height: '1.25rem' }} />} label="Settings" />
            <MobileNavItem to="/" icon={<LogOut style={{ width: '1.25rem', height: '1.25rem' }} />} label="Log Out" variant="danger" />
          </div>
        </div>
      )}
    </div>
  )
}

function MobileNavItem({ to, icon, label, variant = "default" }: { to: string, icon: React.ReactNode, label: string, variant?: "default" | "danger" }) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  const getStyles = (active: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
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

  return (
    <NavLink 
      to={to}
      style={({ isActive: linkActive }) => getStyles(isActive || linkActive)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <span style={{ fontSize: '1rem', flex: 1 }}>{label}</span>
    </NavLink>
  )
}
