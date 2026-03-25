import { useState, useEffect } from "react"
import { Maximize2, Settings, Shield } from "lucide-react"

interface CameraFeedProps {
  cameraName: string
}

export function CameraFeed({ cameraName }: CameraFeedProps) {
  const [isBlinking, setIsBlinking] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setIsBlinking(prev => !prev), 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: '400px',
      margin: '0 0 2rem 0',
      backgroundColor: 'transparent'
    }}>
      {/* Borderless Header */}
      <div style={{ 
        padding: '0 0 1rem 0', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Stream // {cameraName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.375rem', 
            padding: '0.25rem 0.625rem', 
            backgroundColor: '#FEE2E2', 
            borderRadius: '0.375rem'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444', opacity: isBlinking ? 1 : 0.3 }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444' }}>REC</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748B' }}><Maximize2 size={16} /></button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748B' }}><Settings size={16} /></button>
          </div>
        </div>
      </div>

      {/* Video Content Area */}
      <div style={{ 
        position: 'relative', 
        flex: 1, 
        backgroundColor: '#000000', 
        borderRadius: '0.75rem', // Keep radius for the video itself
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Simplified Overlay HUD */}
        <div style={{ 
          position: 'absolute', 
          top: '1.5rem', 
          left: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          zIndex: 10
        }}>
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.6)', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>
              BITRATE: 6.2 MBPS // RES: 3840x2160 P60
            </span>
          </div>
        </div>

        {/* AI Bounding Box (Simulation) */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '40%',
          width: '200px',
          height: '240px',
          border: '2px solid #10B981',
          zIndex: 5
        }}>
          <div style={{
            position: 'absolute',
            top: '-24px',
            left: '-2px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            OBJECT_DET: BACKPACK (98.4%)
          </div>
        </div>

        {/* Placeholder Video Visual */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.4
        }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', letterSpacing: '0.5em', fontWeight: 700 }}>NEURAL_FEED_ACTIVE</span>
        </div>
      </div>
    </div>
  )
}
