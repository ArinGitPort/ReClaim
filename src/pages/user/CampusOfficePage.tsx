import { TopNavBar } from "@/layouts/TopNavBar"
import { CampusOfficeMap } from "@/components/user/CampusOfficeMap"
import { Building2, Info, Navigation2, Clock } from "lucide-react"

export function CampusOfficePage() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '6rem', backgroundColor: '#F8FAFC' }}>
      <TopNavBar title="Physical Office Location" />

      <main style={{ maxWidth: '64rem', margin: '2rem auto 0', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Campus Admin Office</h1>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>Visit our physical helpdesk for item verification and secure handover.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#EFF6FF', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 style={{ width: '1.25rem', height: '1.25rem', color: '#1E2F85' }} />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Current Status</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669', margin: 0 }}>OPEN NOW</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          {/* Main Map Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <CampusOfficeMap />
             
             <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <Navigation2 style={{ width: '1.25rem', height: '1.25rem', color: '#1E2F85' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Wayfinding Instructions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Step num={1} text="Enter through the Main Admin Building Gate A." />
                  <Step num={2} text="Proceed to the 2nd Floor and look for Wing B." />
                  <Step num={3} text="Our office is located next to the Registrar's Hall." />
                </div>
             </div>
          </div>

          {/* Side Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#1E2F85', borderRadius: '1.25rem', padding: '1.5rem', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Clock style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.8)' }} />
                  <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Operating Hours</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <TimeSlot day="Mon - Fri" time="8:00 AM - 5:00 PM" />
                  <TimeSlot day="Saturday" time="9:00 AM - 12:00 PM" />
                  <TimeSlot day="Sunday" time="CLOSED" isClosed />
                </div>
              </div>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '8rem', height: '8rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', filter: 'blur(32px)', transform: 'translate(30%, -30%)' }} />
            </div>

            <div style={{ backgroundColor: '#F1F5F9', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Info style={{ width: '1.25rem', height: '1.25rem', color: '#475569' }} />
                  <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', margin: 0 }}>Handover Policy</h3>
               </div>
               <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                 Students must present their <strong>Student ID</strong> and the active <strong>Pickup Token</strong> generated in the app. Items not claimed within 90 days will be subject to disposal or donation.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Step({ num, text }: { num: number, text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '9999px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: '#1E2F85', flexShrink: 0 }}>
        {num}
      </div>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', margin: 0 }}>{text}</p>
    </div>
  )
}

function TimeSlot({ day, time, isClosed = false }: { day: string, time: string, isClosed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>{day}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isClosed ? '#F87171' : '#FFFFFF' }}>{time}</span>
    </div>
  )
}
