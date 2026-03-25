import { Moon, Laptop, Sun, Save, Mail, Smartphone, Globe, Shield } from "lucide-react"
import { useState } from "react"

export function AdminSettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '6rem', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
      <main style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0F172A', margin: 0 }}>System Settings</h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Manage global preferences and infrastructure behavior.</p>
          </div>
          <button 
            onClick={handleSave}
            style={{ display: 'inline-flex', height: '2.25rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', backgroundColor: '#1E2F85', padding: '0 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#FFFFFF', border: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', cursor: 'pointer' }}
          >
             {isSaving ? "Saving..." : <><Save style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} /> Save Configuration</>}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Admin Controls */}
          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '1.5rem', backgroundColor: 'rgba(248, 250, 252, 0.5)', borderRadius: '0.75rem 0.75rem 0 0', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Administrative Routing</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Manage internal system operations and staff authorities.</p>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '15rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', padding: '1rem', cursor: 'pointer' }}>
                  <Globe style={{ height: '1.25rem', width: '1.25rem', color: '#1E2F85', marginBottom: '0.5rem' }} />
                  <h4 style={{ fontWeight: 500, fontSize: '0.875rem', color: '#0F172A', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>Manage Campus Zones</h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Configure pick-up locations and infrastructure categories</p>
                </div>
                <div style={{ flex: 1, minWidth: '15rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', padding: '1rem', cursor: 'pointer' }}>
                  <Shield style={{ height: '1.25rem', width: '1.25rem', color: '#1E2F85', marginBottom: '0.5rem' }} />
                  <h4 style={{ fontWeight: 500, fontSize: '0.875rem', color: '#0F172A', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>Staff Role Permissions</h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Edit access permissions for staff and security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Alert Hooks</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Configure how you receive system alerts and infrastructure updates.</p>
            </div>
            <div style={{ padding: '1.5rem', paddingTop: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.5rem', border: '1px solid #E2E8F0', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail style={{ height: '1rem', width: '1rem', color: '#64748B' }} /> Supervisor Emails</span>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Receive daily digest updates regarding lost batches.</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  style={{ display: 'inline-flex', height: '1.5rem', width: '2.75rem', flexShrink: 0, cursor: 'pointer', alignItems: 'center', borderRadius: '9999px', border: '2px solid transparent', backgroundColor: notifications ? '#1E2F85' : '#E2E8F0', padding: 0 }}
                >
                  <span style={{ display: 'block', height: '1.25rem', width: '1.25rem', borderRadius: '9999px', backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transform: notifications ? 'translateX(1.25rem)' : 'translateX(0)' }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.5rem', border: '1px solid #E2E8F0', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Smartphone style={{ height: '1rem', width: '1rem', color: '#64748B' }} /> High-Priority Pings</span>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Get instant native push alerts for critical security events.</p>
                </div>
                <button style={{ display: 'inline-flex', height: '1.5rem', width: '2.75rem', flexShrink: 0, cursor: 'pointer', alignItems: 'center', borderRadius: '9999px', border: '2px solid transparent', backgroundColor: '#1E2F85', padding: 0 }}>
                  <span style={{ display: 'block', height: '1.25rem', width: '1.25rem', borderRadius: '9999px', backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transform: 'translateX(1.25rem)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Card */}
          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Console Appearance</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Customize the theme of the terminal interface.</p>
            </div>
            <div style={{ padding: '1.5rem', paddingTop: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: '1rem' }}>
                <button onClick={() => setDarkMode(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '2px solid', padding: '1rem', backgroundColor: !darkMode ? 'rgba(30, 47, 133, 0.05)' : 'transparent', borderColor: !darkMode ? '#1E2F85' : '#E2E8F0', cursor: 'pointer' }}>
                  <Sun style={{ height: '1.25rem', width: '1.25rem', color: !darkMode ? '#1E2F85' : '#64748B' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: !darkMode ? '#1E2F85' : '#0F172A' }}>Light</span>
                </button>
                <button onClick={() => setDarkMode(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '2px solid', padding: '1rem', backgroundColor: darkMode ? 'rgba(30, 47, 133, 0.05)' : 'transparent', borderColor: darkMode ? '#1E2F85' : '#E2E8F0', cursor: 'pointer' }}>
                  <Moon style={{ height: '1.25rem', width: '1.25rem', color: darkMode ? '#1E2F85' : '#64748B' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#1E2F85' : '#0F172A' }}>Dark</span>
                </button>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '2px solid', padding: '1rem', backgroundColor: 'transparent', borderColor: '#E2E8F0', cursor: 'pointer' }}>
                  <Laptop style={{ height: '1.25rem', width: '1.25rem', color: '#64748B' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A' }}>System</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
