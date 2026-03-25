import { useState, useEffect } from "react"
import { Bot, ShieldCheck } from "lucide-react"

export function SmartSnapCamera({ onCapture }: { onCapture: () => void }) {
  const [isDetecting, setIsDetecting] = useState(true)
  const [isStable, setIsStable] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showFlash, setShowFlash] = useState(false)
  const [lastCaptured, setLastCaptured] = useState<string | null>(null)
  
  // Simulation intervals
  useEffect(() => {
    // Simulate finding an object after 2 seconds
    const startDetection = setTimeout(() => {
      setIsStable(true)
      setCountdown(3)
    }, 2000)

    return () => {
      clearTimeout(startDetection)
    }
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isStable && countdown === 0 && isDetecting) {
      handleCapture()
    }
  }, [countdown, isStable, isDetecting])

  const handleCapture = () => {
    setShowFlash(true)
    setIsDetecting(false)
    setIsStable(false)
    setLastCaptured("Smart Tablet (Prediction: Electronics)")
    
    setTimeout(() => {
      setShowFlash(false)
      onCapture()
      // Reset after a few seconds
      setTimeout(() => {
        setIsDetecting(true)
        setLastCaptured(null)
        setCountdown(0)
      }, 5000)
    }, 200)
  }

  return (
    <div style={{ position: 'relative', backgroundColor: '#0F172A', borderRadius: '2.5rem', overflow: 'hidden', border: '8px solid #1E293B', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', aspectRatio: '16/9' }}>
      {/* Mock Camera Feed Background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1541829070764-84a7d30dee73?auto=format&fit=crop&q=80&w=1200")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6, mixBlendMode: 'overlay' }} />
      
      {/* Dynamic Grid Overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', opacity: 0.2 }}>
        {[...Array(16)].map((_, i) => (
          <div key={i} style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }} />
        ))}
      </div>

      {/* Scanning Header */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', right: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#EF4444' }} />
          <span style={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.2em', fontSize: '10px', textTransform: 'uppercase' }}>Node 04: Library Entrance</span>
        </div>
        <div style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot style={{ width: '1rem', height: '1rem', color: '#818CF8' }} />
          <span style={{ color: '#FFFFFF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Detection Active</span>
        </div>
      </div>

      {/* Target Bounding Box Simulation */}
      {isStable && isDetecting && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
           <div style={{ position: 'relative', width: '16rem', height: '16rem', border: '2px solid #818CF8', borderRadius: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '1.5rem', height: '1.5rem', borderTop: '4px solid #6366F1', borderLeft: '4px solid #6366F1', borderRadius: '0.125rem 0 0 0' }} />
              <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '1.5rem', height: '1.5rem', borderTop: '4px solid #6366F1', borderRight: '4px solid #6366F1', borderRadius: '0 0.125rem 0 0' }} />
              <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '1.5rem', height: '1.5rem', borderBottom: '4px solid #6366F1', borderLeft: '4px solid #6366F1', borderRadius: '0 0 0 0.125rem' }} />
              <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '1.5rem', height: '1.5rem', borderBottom: '4px solid #6366F1', borderRight: '4px solid #6366F1', borderRadius: '0 0 0.125rem 0' }} />
              
              {/* Metadata Overlay */}
              <div style={{ position: 'absolute', top: '-3rem', left: 0, right: 0, textAlign: 'center' }}>
                 <p style={{ color: '#818CF8', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>Object Detected</p>
                 <p style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 700, backgroundColor: '#4F46E5', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '0.125rem', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.5)' }}>ELECTRONICS (CONF: 94%)</p>
              </div>

              {/* Countdown */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '5rem', height: '5rem', borderRadius: '9999px', border: '4px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#FFFFFF', fontSize: '2.25rem', fontWeight: 900 }}>{countdown}</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Capture Indicator */}
      {lastCaptured && (
        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
           <div style={{ backgroundColor: '#10B981', color: '#FFFFFF', padding: '1rem 2rem', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShieldCheck style={{ width: '2rem', height: '2rem' }} />
              <div>
                <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.8, margin: 0 }}>Capture Successful</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{lastCaptured}</p>
              </div>
           </div>
        </div>
      )}

      {/* Flash Effect */}
      {showFlash && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF', zIndex: 50 }} />
      )}

      {/* Bottom Status Bar */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(24px)', padding: '1rem 2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '3rem' }}>
           <StatusItem label="Motion" value="None" color="emerald" />
           <StatusItem label="Stability" value={isStable ? "Locked" : "Variable"} color={isStable ? "indigo" : "slate"} />
           <StatusItem label="Temp" value="34°C" color="slate" />
        </div>
      </div>
    </div>
  )
}

function StatusItem({ label, value, color }: { label: string, value: string, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: '#10B981',
    indigo: '#6366F1',
    slate: '#64748B'
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'center' }}>
        <div style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', backgroundColor: colorMap[color] || '#64748B' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{value}</span>
      </div>
    </div>
  )
}
