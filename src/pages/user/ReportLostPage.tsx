import { TopNavBar } from "@/layouts/TopNavBar"
import { ReportLostForm } from "@/features/reports/ReportLostForm"
import { Info, ShieldAlert } from "lucide-react"
import { useIsMobile } from "@/hooks/useIsMobile"

export function ReportLostPage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
      <TopNavBar title="Report a Lost or Missing Item" />
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ 
          maxWidth: '100rem', 
          marginLeft: 'auto', 
          marginRight: 'auto', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: '2rem', 
          padding: isMobile ? '1rem 1rem 6rem' : '1.5rem 2rem 6rem' 
        }}>
          
          {/* Main Form Area */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ width: '100%', maxWidth: '48rem' }}>
              <ReportLostForm />
            </div>
          </div>

          {/* Sidebar Instructions / Tips */}
          <aside style={{ width: isMobile ? '100%' : '20rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
                <Info style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
                Reporting Tips
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', color: '#475569', listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>1</span>
                  <p style={{ margin: 0 }}>Provide specific details like <span style={{ fontWeight: 600, color: '#0F172A' }}>serial numbers</span> or unique stickers.</p>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>2</span>
                  <p style={{ margin: 0 }}>Describe what's <span style={{ fontWeight: 600, color: '#0F172A' }}>inside</span> bags or wallets for faster verification.</p>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>3</span>
                  <p style={{ margin: 0 }}>Don't worry about being vague on the <span style={{ fontWeight: 600, color: '#0F172A' }}>time</span>—approximate is fine.</p>
                </li>
              </ul>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 47, 133, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(30, 47, 133, 0.1)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1E2F85', marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}>
                <ShieldAlert style={{ width: '1rem', height: '1rem' }} />
                Blind Verification
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'rgba(30, 47, 133, 0.8)', lineHeight: '1.5', margin: 0 }}>
                Your "Proof Identifiers" and "Private Notes" are <span style={{ fontWeight: 700 }}>strictly hidden</span> from the public. Only campus administrators use this data to confirm your ownership.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
