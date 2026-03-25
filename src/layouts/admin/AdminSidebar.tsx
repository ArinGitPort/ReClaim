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
  Image as ImageIcon
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function AdminSidebar() {
  const { user } = useAuth()

  return (
    <aside style={{ 
      width: '18rem', 
      backgroundColor: '#1E2F85', 
      color: '#FFFFFF', 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '4px 0 10px -3px rgba(0, 0, 0, 0.1)', 
      zIndex: 50,
      minHeight: '100vh',
      position: 'sticky',
      top: 0
    }}>
      {/* Branding */}
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package style={{ width: '1.5rem', height: '1.5rem', color: '#1E2F85' }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em' }}>
          ReClaim<span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Group: Core Operations */}
        <div>
          <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>Action Queue</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard style={{ width: '1.125rem', height: '1.125rem' }} />} label="Dashboard" />
            <SidebarItem to="/admin/inventory" icon={<Package style={{ width: '1.125rem', height: '1.125rem' }} />} label="Inventory" />
            <SidebarItem to="/admin/reports" icon={<FileSearch style={{ width: '1.125rem', height: '1.125rem' }} />} label="Missing Items" />
            <SidebarItem to="/admin/claims" icon={<HandMetal style={{ width: '1.125rem', height: '1.125rem' }} />} label="Claims Verification" />
          </div>
        </div>

        {/* Group: Records */}
        <div>
          <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>Accountability</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <SidebarItem to="/admin/handover-log" icon={<History style={{ width: '1.125rem', height: '1.125rem' }} />} label="Handover Log" />
            <SidebarItem to="/admin/user-directory" icon={<User style={{ width: '1.125rem', height: '1.125rem' }} />} label="User Directory" />
            <SidebarItem to="/admin/expired-inventory" icon={<Package style={{ width: '1.125rem', height: '1.125rem' }} />} label="Expired Items" />
          </div>
        </div>

        {/* Group: AI Monitoring */}
        <div>
          <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>AI Monitoring</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <SidebarItem to="/admin/cameras" icon={<Camera style={{ width: '1.125rem', height: '1.125rem' }} />} label="CCTV Dashboard" />
            <SidebarItem to="/admin/snapshots" icon={<ImageIcon style={{ width: '1.125rem', height: '1.125rem' }} />} label="Snapshot Gallery" />
          </div>
        </div>

        {/* Group: System */}
        <div>
          <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem', padding: '0 0.75rem' }}>System</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <SidebarItem to="/admin/logs" icon={<History style={{ width: '1.125rem', height: '1.125rem' }} />} label="Audit Archive" />
            <SidebarItem to="/admin/settings" icon={<Settings style={{ width: '1.125rem', height: '1.125rem' }} />} label="Settings" />
          </div>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
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

        <NavLink 
          to="/"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem', 
            borderRadius: '0.75rem', 
            fontSize: '0.875rem', 
            fontWeight: 700, 
            color: 'rgba(255, 255, 255, 0.6)', 
            textDecoration: 'none',
            backgroundColor: 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <LogOut style={{ width: '1.125rem', height: '1.125rem' }} />
          Exit to Portal
        </NavLink>
      </div>
    </aside>
  )
}

function SidebarItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  return (
    <NavLink 
      to={to} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
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
      <span style={{ flex: 1 }}>{label}</span>
    </NavLink>
  )
}
