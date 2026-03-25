import { useEffect } from "react"
import { X, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"

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
  maxWidth: '32rem',
  backgroundColor: '#FFFFFF',
  borderRadius: '0.75rem',
  border: '1px solid #E2E8F0',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
  margin: 'auto',
}

const modalHeaderStyles: React.CSSProperties = {
  padding: '1.5rem',
  borderBottom: '1px solid #F1F5F9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(244, 63, 94, 0.05)',
}

const modalHeaderIconWrapperStyles: React.CSSProperties = {
  width: '2.5rem',
  height: '2.5rem',
  backgroundColor: '#FFE4E6',
  borderRadius: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
}

const modalHeaderTitleStyles: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 800,
  color: '#881337',
  textTransform: 'uppercase',
  letterSpacing: '-0.025em',
  margin: 0,
}

const closeBtnStyles: React.CSSProperties = {
  padding: '0.5rem',
  color: '#94A3B8',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '9999px',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s',
}

const formAreaStyles: React.CSSProperties = {
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
}

const noticeBannerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'start',
  gap: '1rem',
  padding: '1rem',
  backgroundColor: '#FFFBEB',
  borderRadius: '0.75rem',
  border: '1px solid #FEF3C7',
  marginBottom: '0.5rem',
}

const noticeTextStyles: React.CSSProperties = {
  color: '#92400E',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: '1.625',
  margin: 0,
}

const fieldLabelStyles: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 900,
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  marginLeft: '0.25rem',
}

const footerStyles: React.CSSProperties = {
  padding: '1.5rem',
  borderTop: '1px solid #F1F5F9',
  backgroundColor: 'rgba(248, 250, 252, 0.5)',
  display: 'flex',
  gap: '0.75rem',
}

const cancelBtnStyles: React.CSSProperties = {
  flex: 1,
  height: '3rem',
  border: '1px solid #E2E8F0',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontSize: '0.75rem',
  borderRadius: '0.75rem',
}

const confirmBtnStyles = (disabled: boolean): React.CSSProperties => ({
  flex: 1,
  height: '3rem',
  backgroundColor: disabled ? '#CBD5E1' : '#E11D48',
  color: '#FFFFFF',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontSize: '0.75rem',
  borderRadius: '0.75rem',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  boxShadow: disabled ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
})
interface DenyClaimModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  denyReason: string
  setDenyReason: (reason: string) => void
}

export function DenyClaimModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  denyReason, 
  setDenyReason 
}: DenyClaimModalProps) {
  
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
        {/* Header */}
        <div style={modalHeaderStyles}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={modalHeaderIconWrapperStyles}>
              <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#E11D48' }} />
            </div>
            <div>
              <h2 style={modalHeaderTitleStyles}>Deny Claim Request</h2>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyles}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Form Area */}
        <div style={formAreaStyles}>
          <div style={noticeBannerStyles}>
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#B45309', flexShrink: 0, marginTop: '0.125rem' }} />
            <p style={noticeTextStyles}>
              A reason for denial is mandatory. This message will be sent to the student to help them understand why their claim was rejected.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Label style={fieldLabelStyles}>Reason for Denial</Label>
            <Textarea 
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="e.g. The serial number provided does not match our records or the uploaded proof is insufficient..."
              style={{ minHeight: '160px', backgroundColor: '#F8FAFC' }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={footerStyles}>
          <Button 
            variant="outline" 
            onClick={onClose} 
            style={cancelBtnStyles}
          >
            Cancel
          </Button>
          <Button 
            disabled={!denyReason.trim()}
            onClick={() => onConfirm(denyReason)}
            style={confirmBtnStyles(!denyReason.trim())}
          >
            Confirm Denial
          </Button>
        </div>
      </div>
    </div>
  )
}

