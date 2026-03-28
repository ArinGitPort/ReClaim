import { Moon, Laptop, Sun, Save, Mail, Smartphone } from "lucide-react"
import { useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"

export function UserSettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '6rem', backgroundColor: '#F8FAFC' }}>
      <TopNavBar title="Settings" />
      
      <main style={{ maxWidth: '56rem', margin: '2rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Account Settings</h1>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Manage your university profile, notifications, and visual preferences.</p>
          </div>
          <button 
            onClick={handleSave}
            style={{ display: 'inline-flex', height: '2.25rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', backgroundColor: '#1E2F85', padding: '0 1rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: 'none', cursor: 'pointer' }}
          >
             {isSaving ? "Saving..." : <><Save style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} /> Save Changes</>}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Notifications Card */}
          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Notifications</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Configure how you receive alerts and updates.</p>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.5rem', border: '1px solid #E2E8F0', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail style={{ height: '1rem', width: '1rem', color: '#64748B' }} /> Email Notifications</span>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', margin: 0 }}>Receive updates about your claims and reports via email.</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  style={{ display: 'inline-flex', height: '1.5rem', width: '2.75rem', flexShrink: 0, cursor: 'pointer', alignItems: 'center', borderRadius: '9999px', border: '2px solid transparent', backgroundColor: notifications ? '#1E2F85' : '#E2E8F0', position: 'relative' }}
                >
                  <span style={{ display: 'block', height: '1.25rem', width: '1.25rem', borderRadius: '9999px', backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transform: notifications ? 'translateX(1.25rem)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.5rem', border: '1px solid #E2E8F0', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Smartphone style={{ height: '1rem', width: '1rem', color: '#64748B' }} /> Push Notifications</span>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', margin: 0 }}>Get instant alerts on your device for new matches.</p>
                </div>
                <button style={{ display: 'inline-flex', height: '1.5rem', width: '2.75rem', flexShrink: 0, cursor: 'pointer', alignItems: 'center', borderRadius: '9999px', border: '2px solid transparent', backgroundColor: '#1E2F85', position: 'relative' }}>
                  <span style={{ display: 'block', height: '1.25rem', width: '1.25rem', borderRadius: '9999px', backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transform: 'translateX(1.25rem)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Card */}
          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Appearance</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Customize the theme of your application interface.</p>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <button onClick={() => setDarkMode(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '2px solid', borderColor: !darkMode ? '#1E2F85' : '#E2E8F0', padding: '1rem', backgroundColor: !darkMode ? 'rgba(30, 47, 133, 0.05)' : 'transparent', cursor: 'pointer' }}>
                  <Sun style={{ height: '1.25rem', width: '1.25rem', color: !darkMode ? '#1E2F85' : '#64748B' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: !darkMode ? '#1E2F85' : '#0F172A' }}>Light</span>
                </button>
                <button onClick={() => setDarkMode(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '2px solid', borderColor: darkMode ? '#1E2F85' : '#E2E8F0', padding: '1rem', backgroundColor: darkMode ? 'rgba(30, 47, 133, 0.05)' : 'transparent', cursor: 'pointer' }}>
                  <Moon style={{ height: '1.25rem', width: '1.25rem', color: darkMode ? '#1E2F85' : '#64748B' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#1E2F85' : '#0F172A' }}>Dark</span>
                </button>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '2px solid', borderColor: '#E2E8F0', padding: '1rem', backgroundColor: 'transparent', cursor: 'pointer', color: '#0F172A' }}>
                  <Laptop style={{ height: '1.25rem', width: '1.25rem', color: '#64748B' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>System</span>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ borderRadius: '0.75rem', border: '1px solid #FECACA', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginTop: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', color: '#EF4444', margin: 0 }}>Danger Zone</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Irreversible, destructive actions regarding your account.</p>
            </div>
            <div style={{ padding: '1.5rem', paddingTop: 0, borderTop: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ marginTop: '1rem' }}>
                 <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', margin: 0 }}>Delete Account</p>
                 <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', maxWidth: '280px', margin: 0 }}>Removing your account permanently deletes all claims and logs associated with identity.</p>
              </div>
              <button style={{ display: 'inline-flex', height: '2.25rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', backgroundColor: '#FEE2E2', marginTop: '1rem', padding: '0 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#EF4444', border: '1px solid #FECACA', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', cursor: 'pointer' }}>
                Request Deletion
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
