import React from "react"
import { Camera } from "lucide-react"

interface CameraInfo {
  id: string
  name: string
  location: string
}

interface CameraGridProps {
  cameras: CameraInfo[]
  activeId: string
  onSelect: (cam: CameraInfo) => void
}

export function CameraGrid({ cameras, activeId, onSelect }: CameraGridProps) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '1rem',
      backgroundColor: 'transparent',
      padding: '0', // No internal padding needed without container
      border: 'none',
      boxShadow: 'none'
    }}>
      {cameras.map(cam => (
        <button
          key={cam.id}
          onClick={() => onSelect(cam)}
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            backgroundColor: '#000',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: activeId === cam.id ? '2px solid #10B981' : '1px solid transparent',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: activeId === cam.id ? '0 0 12px rgba(16, 185, 129, 0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {/* Thumbnail UI */}
          <div style={{
            flex: 1,
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: activeId === cam.id ? 0.9 : 0.6
          }}>
            <Camera size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>

          {/* Label Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            padding: '6px 10px',
            textAlign: 'left',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              color: 'white', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {cam.name}
            </div>
            <div style={{ 
              fontSize: '8px', 
              fontWeight: 700, 
              color: '#94A3B8',
              letterSpacing: '0.025em'
            }}>
              NODE_ID: {cam.id.toUpperCase()}
            </div>
          </div>

          {/* Active Indicator */}
          {activeId === cam.id && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981'
            }} />
          )}
        </button>
      ))}
    </div>
  )
}
