import { CheckCircle, ArrowRight, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

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
  padding: '2rem',
  margin: 'auto',
  textAlign: 'center',
}

const closeBtnStyles: React.CSSProperties = {
  position: 'absolute',
  right: '1.5rem',
  top: '1.5rem',
  padding: '0.5rem',
  color: '#94A3B8',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',
}

const iconWrapperStyles: React.CSSProperties = {
  width: '4rem',
  height: '4rem',
  backgroundColor: 'rgba(30, 47, 133, 0.1)',
  borderRadius: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1.5rem',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
}

const titleStyles: React.CSSProperties = {
  fontSize: '1.875rem',
  fontWeight: 900,
  color: '#0F172A',
  letterSpacing: '-0.025em',
  marginBottom: '0.5rem',
  lineHeight: 1,
}

const descriptionStyles: React.CSSProperties = {
  color: '#64748B',
  fontSize: '0.875rem',
  marginBottom: '2rem',
  lineHeight: '1.625',
  fontWeight: 500,
}

const infoCardStyles: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '1rem',
  padding: '1.5rem',
  border: '1px solid #F1F5F9',
  marginBottom: '2rem',
  textAlign: 'left',
}

const infoRowStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const labelStyles: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: '#94A3B8',
}

const refNumberStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  fontFamily: 'monospace',
  fontWeight: 900,
  color: '#334155',
}

const statusBadgeStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.25rem 0.75rem',
  backgroundColor: 'rgba(30, 47, 133, 0.1)',
  color: '#1E2F85',
  fontSize: '10px',
  fontWeight: 900,
  borderRadius: '9999px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const statusDotStyles: React.CSSProperties = {
  width: '0.375rem',
  height: '0.375rem',
  backgroundColor: '#1E2F85',
  borderRadius: '9999px',
}

const footerNoteStyles: React.CSSProperties = {
  marginTop: '2rem',
  fontSize: '11px',
  color: '#94A3B8',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
}

interface ReportConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportConfirmationModal({ isOpen, onClose }: ReportConfirmationModalProps) {
  const [refNumber, setRefNumber] = useState("")

  useEffect(() => {
    if (isOpen) {
      setRefNumber("REC-" + Math.random().toString(36).substr(2, 9).toUpperCase())
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
        <button onClick={onClose} style={closeBtnStyles}>
          <X style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        <div style={iconWrapperStyles}>
          <CheckCircle style={{ width: '2rem', height: '2rem', color: '#1E2F85' }} />
        </div>

        <h1 style={titleStyles}>Report Active</h1>
        <p style={descriptionStyles}>
          Your missing item report has been logged. The Campus Admin Office will manually review your submission soon.
        </p>

        <div style={infoCardStyles}>
          <div style={{ ...infoRowStyles, marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
            <span style={labelStyles}>Reference #</span>
            <span style={refNumberStyles}>{refNumber}</span>
          </div>
          <div style={infoRowStyles}>
            <span style={labelStyles}>Current Status</span>
            <span style={statusBadgeStyles}>
              <span style={statusDotStyles} />
              Submitted
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Button asChild style={{ width: '100%', height: '3rem', fontWeight: 900, backgroundColor: '#1E2F85' }} onClick={onClose}>
            <Link to="/my-reports" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              VIEW MY REPORTS
              <ArrowRight style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} />
            </Link>
          </Button>
          <Button variant="outline" style={{ width: '100%', height: '3rem', fontWeight: 700, border: '1px solid #E2E8F0', color: '#475569', borderRadius: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '11px' }} onClick={onClose}>
            Back to Form
          </Button>
        </div>

        <p style={footerNoteStyles}>
          <FileText style={{ width: '0.875rem', height: '0.875rem', opacity: 0.5 }} />
          Real-time verification history available
        </p>
      </div>
    </div>
  )
}

