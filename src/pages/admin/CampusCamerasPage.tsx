import { useState, useEffect } from "react"
import { VMSHeader } from "@/features/admin/vms/VMSHeader"
import { CameraFeed } from "@/features/admin/vms/CameraFeed"
import { CameraGrid } from "@/features/admin/vms/CameraGrid"
import { DetectionLog } from "@/features/admin/vms/DetectionLog"

interface CameraInfo {
  id: string
  name: string
  location: string
}

interface Detection {
  id: string
  item: string
  confidence: number
  location: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

const CAMERAS: CameraInfo[] = [
  { id: "cam-01", name: "Engineering Wing - North", location: "Engineering" },
  { id: "cam-02", name: "Main Library Entrance", location: "Library" },
  { id: "cam-03", name: "Student Gymnasium", location: "Gym" },
  { id: "cam-04", name: "Campus Cafeteria", location: "Cafeteria" },
]

const ITEMS = ["Backpack", "Hydro Flask", "Keys", "Smartphone", "Laptop Bag", "Wallet"]

export function CampusCamerasPage() {
  const [activeCam, setActiveCam] = useState<CameraInfo>(CAMERAS[0])
  const [detections, setDetections] = useState<Detection[]>([])

  // Simulated YOLOv8 Event Loop
  useEffect(() => {
    const generator = setInterval(() => {
      const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)]
      const confidence = Math.floor(Math.random() * (99 - 85 + 1) + 85)
      const newDetection: Detection = {
        id: Math.random().toString(36).substr(2, 9),
        item: randomItem,
        confidence: confidence,
        location: CAMERAS[Math.floor(Math.random() * CAMERAS.length)].name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: confidence > 95 ? "high" : confidence > 90 ? "medium" : "low"
      }

      setDetections(prev => [newDetection, ...prev].slice(0, 15))
    }, Math.floor(Math.random() * (8000 - 5000 + 1) + 5000))

    return () => clearInterval(generator)
  }, [])

  const handleClearDetection = (id: string) => {
    setDetections(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%', 
      height: 'calc(100vh - 64px)', // Account for top navbar if present, or just 100vh
      backgroundColor: '#F8FAFC', 
      overflow: 'hidden',
      padding: '0 2rem 2rem 2rem'
    }}>
      {/* Header occupies its natural height */}
      <VMSHeader 
        title="Node Operations Control" 
        subtitle="Real-time AI Perimeter Monitoring // VMS-NODE-01"
        statusLabel="ACTIVE_SCAN"
      />

      {/* Content Area takes the REST of the height */}
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        gap: '2.5rem',
        overflow: 'hidden', // Crucial: This container prevents stretching
        minHeight: 0 // Allow flex child to shrink below content size
      }}>
        {/* Main Feed Column (70%) */}
        <div style={{ flex: 7, display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2rem' }}>
          <CameraFeed cameraName={activeCam.name} />
          <CameraGrid 
            cameras={CAMERAS} 
            activeId={activeCam.id} 
            onSelect={setActiveCam} 
          />
        </div>

        {/* Event Log Column (30%) */}
        <div style={{ 
          flex: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: '340px',
          backgroundColor: 'transparent'
        }}>
          <DetectionLog 
            detections={detections} 
            onClear={handleClearDetection} 
          />
        </div>
      </div>
    </div>
  )
}
