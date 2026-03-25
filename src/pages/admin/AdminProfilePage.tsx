import { useAuth } from "@/contexts/AuthContext"
import { User, Calendar, Camera, Key, Fingerprint, History, MapPin } from "lucide-react"

export function AdminProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'rgba(248, 250, 252, 0.5)', paddingBottom: '6rem' }}>
      <main style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
          {/* Use flex for column layout on desktop */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Left Column */}
            <div style={{ flex: '1 1 20rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ height: '7rem', width: '7rem', borderRadius: '9999px', overflow: 'hidden', border: '2px solid #F1F5F9', backgroundColor: 'rgba(241, 245, 249, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User style={{ height: '3rem', width: '3rem', color: '#CBD5E1' }} />
                      )}
                    </div>
                    <button style={{ position: 'absolute', bottom: 0, right: 0, padding: '0.5rem', borderRadius: '9999px', backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #E2E8F0', color: '#334155', cursor: 'pointer' }}>
                      <Camera style={{ height: '1rem', width: '1rem' }} />
                    </button>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.025em', margin: 0 }}>{user.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500, margin: 0 }}>{user.role}</p>
                  </div>
                  <div style={{ width: '100%', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A' }}>42</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, letterSpacing: '-0.025em' }}>Verifications</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A' }}>89</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, letterSpacing: '-0.025em' }}>Archived</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '1.5rem', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Administrator Security</h3>
                </div>
                <div style={{ padding: '1.5rem', paddingTop: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#334155', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key style={{ height: '1rem', width: '1rem', color: '#94A3B8' }} /> Password</span>
                  </button>
                  <button style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#334155', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Fingerprint style={{ height: '1rem', width: '1rem', color: '#94A3B8' }} /> Two-Factor Auth</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', border: '1px solid #BFDBFE', backgroundColor: '#EFF6FF', padding: '0.125rem 0.5rem', fontSize: '10px', fontWeight: 600, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active</span>
                  </button>
                  <button style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#334155', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History style={{ height: '1rem', width: '1rem', color: '#94A3B8' }} /> Audit Log Access</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: '2 1 30rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Staff Information</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>System authorization records and primary identification.</p>
                </div>
                <div style={{ padding: '1.5rem', paddingTop: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1, color: '#0F172A' }}>Full Name</label>
                    <div style={{ display: 'flex', height: '2.5rem', width: '100%', borderRadius: '0.375rem', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#475569', boxSizing: 'border-box', alignItems: 'center' }}>
                      {user.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1, color: '#0F172A' }}>Staff Email</label>
                    <div style={{ display: 'flex', height: '2.5rem', width: '100%', borderRadius: '0.375rem', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#475569', boxSizing: 'border-box', alignItems: 'center' }}>
                      {user.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1, color: '#0F172A' }}>Role Identifier</label>
                    <div style={{ display: 'flex', height: '2.5rem', width: '100%', borderRadius: '0.375rem', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#475569', boxSizing: 'border-box', alignItems: 'center' }}>
                      {user.role} Authorization
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1, color: '#0F172A' }}>Employment Date</label>
                    <div style={{ display: 'flex', height: '2.5rem', width: '100%', borderRadius: '0.375rem', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#64748B', boxSizing: 'border-box', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar style={{ height: '1rem', width: '1rem' }} /> August 2021
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>Jurisdiction Assignment</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Your registered physical campus administration scope.</p>
                </div>
                <div style={{ padding: '1.5rem', paddingTop: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.5rem', border: '1px solid #E2E8F0', padding: '1rem', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderRadius: '0.375rem' }}>
                        <MapPin style={{ height: '1.25rem', width: '1.25rem', color: '#1E2F85' }} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 500, fontSize: '0.875rem', color: '#0F172A', margin: 0 }}>National University - Main</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.125rem', margin: '0.125rem 0 0 0' }}>Manila, Philippines</p>
                      </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', border: '1px solid rgba(30, 47, 133, 0.2)', backgroundColor: '#EFF6FF', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600, color: '#1E2F85' }}>
                      Headquarters
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: '0.75rem', backgroundColor: '#0F172A', color: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ padding: '1.5rem', position: 'relative', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ maxWidth: '24rem' }}>
                      <h3 style={{ fontWeight: 600, letterSpacing: '-0.025em', fontSize: '1.125rem', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>Dev Console Access</h3>
                      <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: '1.5rem', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' }}>
                        For advanced system recovery or configuration routing, utilize the central directory platform.
                      </p>
                      <button style={{ display: 'inline-flex', height: '2.25rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', backgroundColor: '#FFFFFF', padding: '0 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', border: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', cursor: 'pointer' }}>
                        Open Console
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '16rem', height: '16rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', filter: 'blur(48px)', transform: 'translate(50%, -50%)', pointerEvents: 'none' }} />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
