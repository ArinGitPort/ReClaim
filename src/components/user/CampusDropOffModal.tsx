import { X, Shield, MapPin, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface CampusDropOffModalProps {
  onClose: () => void
}

export function CampusDropOffModal({ onClose }: CampusDropOffModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)' }} onClick={onClose} />
      
      <div style={{ position: 'relative', width: '100%', maxWidth: '36rem', backgroundColor: '#FFFFFF', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#1E2F85', padding: '2.5rem 2rem', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: '16rem', height: '16rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px' }} />
          
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', color: '#FFFFFF', transition: 'background-color 0.2s' }}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.025em', margin: '0 0 0.5rem' }}>Campus Drop-Off Guide</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, maxWidth: '24rem', margin: 0 }}>Found something? Here's how to return it to its rightful owner.</p>
          </div>
        </div>

        {/* Instructions Body */}
        <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', backgroundColor: '#FFFFFF' }}>
          
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '3rem', height: '3rem', backgroundColor: '#1E2F8510', border: '1px solid #1E2F8520', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#1E2F85' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#1E2F85', margin: '0 0 0.25rem' }}>Step 1: Secure the Item</h3>
              <p style={{ color: '#475569', fontWeight: 500, fontSize: '0.875rem', lineHeight: '1.625', margin: 0 }}>
                Please keep the item safe in your possession until you can officially turn it in. Do not leave it unattended in hallways or public areas.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '3rem', height: '3rem', backgroundColor: '#D9770610', border: '1px solid #D9770620', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <MapPin style={{ width: '1.5rem', height: '1.5rem', color: '#D97706' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D97706', margin: '0 0 0.25rem' }}>Step 2: Visit the ITSO Office</h3>
              <p style={{ color: '#475569', fontWeight: 500, fontSize: '0.875rem', lineHeight: '1.625', margin: 0 }}>
                Bring the found item directly to the <span style={{ color: '#0F172A', fontWeight: 800 }}>ITSO Office (Building A)</span>. Our technical staff at this location is the designated team for managing the campus-wide Lost & Found database.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '3rem', height: '3rem', backgroundColor: '#05966910', border: '1px solid #05966920', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <ArrowRight style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#059669', margin: '0 0 0.25rem' }}>Step 3: Hand it to the Staff</h3>
              <p style={{ color: '#475569', fontWeight: 500, fontSize: '0.875rem', lineHeight: '1.625', margin: 0 }}>
                Simply surrender the item to the personnel on duty. They will handle the technical process of logging the item into the system so the rightful owner can claim it.
              </p>
            </div>
          </div>

          {/* Bottom Action */}
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
              <Info style={{ width: '1rem', height: '1rem' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available 8 AM - 6 PM Daily</span>
            </div>
            <Button 
              onClick={onClose}
              style={{ padding: '0 1.5rem', height: '3rem', backgroundColor: '#1E2F85', color: '#FFFFFF', fontWeight: 700, borderRadius: '0.75rem' }}
            >
              I Understand <ArrowRight style={{ marginLeft: '0.5rem', width: '1rem', height: '1rem' }} />
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
