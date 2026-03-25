import React from "react"
import { CheckCircle2, XCircle, MapPin, Clock } from "lucide-react"

interface Snapshot {
  id: string
  item: string
  confidence: number
  location: string
  timestamp: string
  imageUrl: string
  severity: "low" | "medium" | "high"
}

interface SnapshotCardProps {
  snapshot: Snapshot
  onReview: (id: string, action: 'verify' | 'discard') => void
}

export function SnapshotCard({ snapshot, onReview }: SnapshotCardProps) {
  const getSeverityStyle = (severity: string) => {
    switch(severity) {
      case "high": return { color: "#E11D48", bg: "#FFF1F2", border: "#FECDD3" }
      case "medium": return { color: "#F59E0B", bg: "#FFFBEB", border: "#FEF3C7" }
      default: return { color: "#10B981", bg: "#F0FDF4", border: "#DCFCE7" }
    }
  }

  const style = getSeverityStyle(snapshot.severity)

  return (
    <div style={{
      backgroundColor: 'transparent',
      borderRadius: '0.75rem',
      border: 'none',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease'
    }}>
      {/* Visual Area */}
      <div style={{ 
        position: 'relative', 
        aspectRatio: '16/10', 
        backgroundColor: '#E2E8F0', 
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <img 
          src={snapshot.imageUrl} 
          alt={snapshot.item} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* HUD Overlay Label */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          backgroundColor: 'rgba(30, 47, 133, 0.85)', // Brand Navy with alpha
          color: 'white',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 800,
          textTransform: 'uppercase',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(4px)'
        }}>
          DET_LOG: {snapshot.item}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1rem 0.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: '#0F172A', // Restored Black
              margin: 0,
              letterSpacing: '-0.025em' 
            }}>
              {snapshot.item}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '11px', fontWeight: 600, marginTop: '0.25rem' }}>
              <MapPin style={{ width: '0.75rem', height: '0.75rem', color: '#94A3B8' }} />
              {snapshot.location}
            </div>
          </div>
          <div style={{ 
            padding: '0.25rem 0.625rem', 
            borderRadius: '9999px', 
            fontSize: '11px', 
            fontWeight: 800,
            backgroundColor: '#FFFFFF', // Restored white for contrast
            color: style.color,
            border: `1px solid #E2E8F0`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            {snapshot.confidence}%
          </div>
        </div>

        {/* Minimalist Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '10px', fontWeight: 700 }}>
          <Clock style={{ width: '14px', height: '14px', color: '#1E2F85' }} />
          DET_TIME: {snapshot.timestamp}
        </div>
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem',
        marginTop: '0.25rem'
      }}>
        <button
          onClick={() => onReview(snapshot.id, 'verify')}
          style={{
            flex: 1,
            height: '2.75rem',
            backgroundColor: '#1E2F85', // REVERTED TO Brand Navy
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontWeight: 800,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(30, 47, 133, 0.15)'
          }}
        >
          <CheckCircle2 size={16} /> Mark as Verified
        </button>
        <button
          onClick={() => onReview(snapshot.id, 'discard')}
          style={{
            height: '2.75rem',
            padding: '0 1.25rem',
            backgroundColor: '#FFFFFF',
            color: '#64748B',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
            fontWeight: 800,
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  )
}
