import { X, Shield, MapPin, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/Button"

const modalOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
}

const modalBackdropStyles: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
}

const modalContentStyles: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '36rem',
  backgroundColor: '#FFFFFF',
  borderRadius: '1.5rem',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
}

const modalHeaderStyles: React.CSSProperties = {
  backgroundColor: '#1E2F85',
  padding: '2.5rem 2rem',
  color: '#FFFFFF',
  position: 'relative',
  overflow: 'hidden',
}

const closeBtnStyles: React.CSSProperties = {
  position: 'absolute',
  top: '1.5rem',
  right: '1.5rem',
  padding: '0.5rem',
  borderRadius: '9999px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  cursor: 'pointer',
  color: '#FFFFFF',
  transition: 'background-color 0.2s',
}

const instructionBodyStyles: React.CSSProperties = {
  padding: '2.5rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
  backgroundColor: '#FFFFFF',
}

const stepWrapperStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
}

const stepIconWrapperStyles = (color: string): React.CSSProperties => ({
  flexShrink: 0,
  width: '3rem',
  height: '3rem',
  backgroundColor: `${color}10`, // Subtle version of the color
  border: `1px solid ${color}20`,
  borderRadius: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
})

const stepTitleStyles = (color: string): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: color,
  margin: '0 0 0.25rem',
})

const stepDescStyles: React.CSSProperties = {
  color: '#475569',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.625',
  margin: 0,
}

const bottomActionStyles: React.CSSProperties = {
  paddingTop: '1.5rem',
  borderTop: '1px solid #F1F5F9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'between',
}

interface CampusDropOffModalProps {
  onClose: () => void
}

export function CampusDropOffModal({ onClose }: CampusDropOffModalProps) {
  return (
    <div style={modalOverlayStyles}>
      <div style={modalBackdropStyles} onClick={onClose} />
      
      <div style={modalContentStyles}>
        {/* Header */}
        <div style={modalHeaderStyles}>
          <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: '16rem', height: '16rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px' }} />
          
          <button onClick={onClose} style={closeBtnStyles}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.025em', margin: '0 0 0.5rem' }}>Campus Drop-Off Guide</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, maxWidth: '24rem', margin: 0 }}>Found something? Here's how to return it to its rightful owner.</p>
          </div>
        </div>

        {/* Instructions Body */}
        <div style={instructionBodyStyles}>
          
          {/* Step 1 */}
          <div style={stepWrapperStyles}>
            <div style={stepIconWrapperStyles('#1E2F85')}>
              <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#1E2F85' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={stepTitleStyles('#1E2F85')}>Step 1: Secure the Item</h3>
              <p style={stepDescStyles}>
                Please keep the item safe in your possession until you can officially turn it in. Do not leave it unattended in hallways or public areas.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={stepWrapperStyles}>
            <div style={stepIconWrapperStyles('#D97706')}>
              <MapPin style={{ width: '1.5rem', height: '1.5rem', color: '#D97706' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={stepTitleStyles('#D97706')}>Step 2: Visit the ITSO Office</h3>
              <p style={stepDescStyles}>
                Bring the found item directly to the <span style={{ color: '#0F172A', fontWeight: 800 }}>ITSO Office (Building A)</span>. Our technical staff at this location is the designated team for managing the campus-wide Lost & Found database.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={stepWrapperStyles}>
            <div style={stepIconWrapperStyles('#059669')}>
              <ArrowRight style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={stepTitleStyles('#059669')}>Step 3: Hand it to the Staff</h3>
              <p style={stepDescStyles}>
                Simply surrender the item to the personnel on duty. They will handle the technical process of logging the item into the system so the rightful owner can claim it.
              </p>
            </div>
          </div>

          {/* Bottom Action */}
          <div style={bottomActionStyles}>
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
