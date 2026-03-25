import { AlertCircle, History, Package } from "lucide-react"

interface Detection {
  id: string
  item: string
  confidence: number
  location: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface DetectionLogProps {
  detections: Detection[]
  onClear: (id: string) => void
}

export function DetectionLog({ detections, onClear }: DetectionLogProps) {

  // Refined Severity Styles using your project colors
  const getStyles = (severity: string) => {
    if (severity === "high") return { color: "#E11D48", bg: "#FFF1F2" }
    if (severity === "medium") return { color: "#F59E0B", bg: "#FFFBEB" }
    return { color: "#10B981", bg: "#F0FDF4" }
  }

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'transparent',
      border: 'none',
      minWidth: '320px',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Log Header - Brand Navy */}
      <div style={{ 
        padding: '0 0 1rem 0', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live AI Detections
          </span>
        </div>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          padding: '0.25rem 0.625rem', 
          backgroundColor: '#1E2F85', 
          color: 'white', 
          borderRadius: '9999px' 
        }}>
          {detections.length} EVENTS
        </div>
      </div>

      {/* Constraints: Scrollable area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        paddingRight: '0.5rem'
      }}>
        {detections.length === 0 ? (
          <div style={{ 
            height: '200px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            opacity: 0.5,
            textAlign: 'center'
          }}>
            <AlertCircle size={24} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Neural_Engine_Ready</div>
          </div>
        ) : (
          detections.map(det => {
            const style = getStyles(det.severity)
            return (
              <div key={det.id} style={{
                backgroundColor: '#FFFFFF', // RESTORED white background
                borderRadius: '0.75rem',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Package style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{det.item}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>{det.timestamp}</span>
                </div>

                <div style={{ 
                  fontSize: '11px', 
                  color: '#64748B', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <span style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: 800 }}>LOC://</span> {det.location}
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginTop: '0.25rem'
                }}>
                  <div style={{ 
                    padding: '0.25rem 0.625rem', 
                    borderRadius: '6px', 
                    fontSize: '10px', 
                    fontWeight: 800,
                    backgroundColor: style.bg,
                    color: style.color,
                    textTransform: 'uppercase',
                    border: `1px solid ${style.color}20`
                  }}>
                    CONFIDENCE: {det.confidence}%
                  </div>
                  <button 
                    onClick={() => onClear(det.id)}
                    style={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      color: '#94A3B8', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
