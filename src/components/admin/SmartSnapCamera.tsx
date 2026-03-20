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
    let timer: any
    
    // Simulate finding an object after 2 seconds
    const startDetection = setTimeout(() => {
      setIsStable(true)
      setCountdown(3)
    }, 2000)

    return () => {
      clearTimeout(startDetection)
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isStable && countdown === 0 && isDetecting) {
      handleCapture()
    }
  }, [countdown, isStable])

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
    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border-8 border-slate-800 shadow-2xl relative aspect-video group">
      {/* Mock Camera Feed Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541829070764-84a7d30dee73?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-60 mix-blend-overlay" />
      
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="border border-white/20" />
        ))}
      </div>

      {/* Scanning Header */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-red-500 animate-pulse`} />
          <span className="text-white font-bold tracking-[0.2em] text-[10px] uppercase">Node 04: Library Entrance</span>
        </div>
        <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span className="text-white text-[10px] font-bold uppercase tracking-widest">AI Detection Active</span>
        </div>
      </div>

      {/* Target Bounding Box Simulation */}
      {isStable && isDetecting && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="relative w-64 h-64 border-2 border-indigo-400 animate-pulse rounded-lg bg-indigo-500/5">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-sm" />
              
              {/* Metadata Overlay */}
              <div className="absolute -top-12 left-0 right-0 text-center">
                 <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Object Detected</p>
                 <p className="text-white text-xs font-bold bg-indigo-600 inline-block px-3 py-1 rounded-sm shadow-lg shadow-indigo-500/50">ELECTRONICS (CONF: 94%)</p>
              </div>

              {/* Countdown */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
                   <span className="text-white text-4xl font-black">{countdown}</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Capture Indicator */}
      {lastCaptured && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up">
           <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-green-500/50 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Capture Successful</p>
                <p className="text-sm font-bold">{lastCaptured}</p>
              </div>
           </div>
        </div>
      )}

      {/* Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-out fade-out" />
      )}

      {/* Bottom Status Bar */}
      <div className="absolute bottom-8 left-8 right-8 flex items-center justify-center z-10">
        <div className="bg-black/60 backdrop-blur-xl px-10 py-4 rounded-3xl border border-white/10 flex items-center gap-12">
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
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    slate: 'bg-slate-500'
  }
  return (
    <div className="text-center group-hover:scale-105 transition-transform">
      <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-center gap-1.5 justify-center">
        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color] || 'bg-slate-500'}`} />
        <span className="text-xs font-bold text-white tracking-widest uppercase">{value}</span>
      </div>
    </div>
  )
}
