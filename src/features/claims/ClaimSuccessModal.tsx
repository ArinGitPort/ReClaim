import { CheckCircle2, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useEffect } from "react"

const modalOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'center',
  overflowY: 'auto',
  padding: '2.5rem 1rem',
}

const modalBackdropStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
}

const modalContentStyles: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '28rem',
  backgroundColor: '#FFFFFF',
  borderRadius: '0.75rem',
  border: '1px solid #E2E8F0',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  padding: '2rem 3rem',
  margin: 'auto',
  textAlign: 'center',
}

const headerIconWrapperStyles: React.CSSProperties = {
  width: '5rem',
  height: '5rem',
  backgroundColor: '#ECFDF5',
  borderRadius: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 2rem',
  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  border: '4px solid rgba(16, 185, 129, 0.1)',
}

const titleStyles: React.CSSProperties = {
  fontSize: '1.875rem',
  fontWeight: 900,
  color: '#0F172A',
  letterSpacing: '-0.025em',
  marginBottom: '0.75rem',
  lineHeight: 1,
  textTransform: 'uppercase',
}

const descriptionStyles: React.CSSProperties = {
  color: '#64748B',
  fontSize: '0.875rem',
  marginBottom: '2rem',
  lineHeight: '1.625',
  fontWeight: 500,
}

const statusNoticeStyles: React.CSSProperties = {
  marginTop: '2rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid #F1F5F9',
  fontSize: '10px',
  fontWeight: 900,
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
}

interface ClaimSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  claimId: string
}

export function ClaimSuccessModal({ isOpen, onClose, claimId }: ClaimSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={modalOverlayStyles}>
      <div style={modalBackdropStyles} onClick={onClose} />

      <div style={modalContentStyles}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.5rem', color: '#94A3B8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '0.75rem' }}
        >
          <X style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        <div style={headerIconWrapperStyles}>
          <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem', color: '#059669' }} />
        </div>

        <h2 style={titleStyles}>Claim Processed</h2>
        <p style={descriptionStyles}>
          The verification for <span style={{ color: '#0F172A', fontWeight: 800 }}>{claimId}</span> has been completed. The student will receive an official notification shortly.
        </p>

        <Button 
          onClick={onClose}
          style={{ width: '100%', height: '3.5rem', backgroundColor: '#059669', color: '#FFFFFF', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '0.75rem' }}
        >
          Return to Queue
          <ArrowRight style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem', opacity: 0.5 }} />
        </Button>

        <div style={statusNoticeStyles}>
          <span style={{ width: '0.375rem', height: '0.375rem', backgroundColor: '#10B981', borderRadius: '9999px' }} />
          System Ledger Updated
        </div>
      </div>
    </div>
  )
}

