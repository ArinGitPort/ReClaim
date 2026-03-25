import { Bell, Search, Settings, HelpCircle, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function AdminTopNavBar() {
  const { user } = useAuth()

  return (
    <header style={{ 
      height: '4.5rem', 
      backgroundColor: '#FFFFFF', 
      borderBottom: '1px solid #E2E8F0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 2rem', 
      position: 'sticky', 
      top: 0, 
      zIndex: 40,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Search Bar / Search Interaction */}
      <div style={{ position: 'relative', width: '24rem', display: 'flex', alignItems: 'center' }}>
        <Search style={{ position: 'absolute', left: '0.875rem', width: '1.125rem', height: '1.125rem', color: '#94A3B8' }} />
        <input 
          type="text" 
          placeholder="Search items, claims, or audit logs..." 
          style={{ 
            width: '100%', 
            height: '2.5rem', 
            backgroundColor: '#F8FAFC', 
            border: '1px solid #E2E8F0', 
            borderRadius: '0.75rem', 
            paddingLeft: '2.5rem', 
            paddingRight: '1rem', 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            color: '#1E293B',
            outline: 'none',
            boxSizing: 'border-box'
          }} 
        />
      </div>

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* System Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', backgroundColor: '#F0FDF4', borderRadius: '9999px', border: '1px solid #DCFCE7' }}>
          <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#22C55E', boxShadow: '0 0 0 2px #DCFCE7' }} />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Online</span>
        </div>

        <div style={{ height: '2rem', width: '1px', backgroundColor: '#E2E8F0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}>
            <HelpCircle style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          
          <button style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
            <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>

          <button style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Settings style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        <div style={{ height: '2rem', width: '1px', backgroundColor: '#E2E8F0' }} />

        {/* Admin Quick Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.75rem', transition: 'background-color 0.2s' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>{user?.name}</p>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#1E2F85', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Head of Security</span>
          </div>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
