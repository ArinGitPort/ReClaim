import { MapPin, User, LogIn, Armchair, ShieldCheck, DoorOpen } from "lucide-react"

export function CampusOfficeMap() {
  return (
    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Campus Office Floor Plan</h3>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Administration Building - Level 2, Wing B</p>
      </div>

      <div style={{ 
        width: '100%', 
        height: '400px', 
        backgroundColor: '#FFFFFF', 
        borderRadius: '1rem', 
        border: '2px solid #F1F5F9', 
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gridTemplateRows: 'repeat(10, 1fr)',
        padding: '0.5rem'
      }}>
        {/* Entrance Area */}
        <div style={{ 
          gridColumn: '1 / 3', 
          gridRow: '8 / 11', 
          backgroundColor: '#F1F5F9', 
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #CBD5E1'
        }}>
          <LogIn style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginTop: '0.25rem' }}>ENTRANCE</span>
        </div>

        {/* Lobby / Waiting Area */}
        <div style={{ 
          gridColumn: '3 / 8', 
          gridRow: '7 / 11', 
          backgroundColor: '#EFF6FF', 
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #DBEAFE'
        }}>
          <Armchair style={{ width: '1.5rem', height: '1.5rem', color: '#1E2F85' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E2F85', marginTop: '0.5rem' }}>LOBBY AREA</span>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#60A5FA' }}>Student Waiting</span>
        </div>

        {/* Claim Verification Center (Target) */}
        <div style={{ 
          gridColumn: '3 / 8', 
          gridRow: '1 / 6', 
          backgroundColor: 'rgba(30, 47, 133, 0.05)', 
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #1E2F85',
          position: 'relative',
          boxShadow: '0 10px 15px -3px rgba(30, 47, 133, 0.1)'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '-0.75rem', 
            backgroundColor: '#1E2F85', 
            color: '#FFFFFF', 
            padding: '0.125rem 0.75rem', 
            borderRadius: '9999px', 
            fontSize: '10px', 
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            You are here
          </div>
          <ShieldCheck style={{ width: '2rem', height: '2rem', color: '#1E2F85' }} />
          <span style={{ fontSize: '12px', fontWeight: 900, color: '#1E2F85', marginTop: '0.5rem' }}>CLAIM COUNTER</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#1E2F85', textAlign: 'center', padding: '0 0.5rem' }}>Verification & Handover</span>
          
          <MapPin style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '1.25rem', height: '1.25rem', color: '#E11D48' }} />
        </div>

        {/* Records Office */}
        <div style={{ 
          gridColumn: '8 / 11', 
          gridRow: '1 / 6', 
          backgroundColor: '#F8FAFC', 
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <User style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8' }}>STAFF ONLY</span>
        </div>

        {/* Security Vault */}
        <div style={{ 
          gridColumn: '1 / 3', 
          gridRow: '1 / 7', 
          backgroundColor: '#F1F5F9', 
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#94A3B8', transform: 'rotate(-90deg)' }}>INVENTORY VAULT</span>
        </div>

        {/* Passage Way */}
        <div style={{ 
          gridColumn: '3 / 8', 
          gridRow: '6 / 7', 
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <DoorOpen style={{ width: '1.25rem', height: '1.25rem', color: '#CBD5E1' }} />
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: 'rgba(30, 47, 133, 0.1)', border: '1px solid #1E2F85', borderRadius: '0.125rem' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Handover Point</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '0.125rem' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Waiting Zone</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '0.125rem' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Restricted Area</span>
        </div>
      </div>
    </div>
  )
}
