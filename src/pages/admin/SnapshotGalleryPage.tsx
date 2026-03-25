import React, { useState } from "react"
import { VMSHeader } from "@/features/admin/vms/VMSHeader"
import { SnapshotGrid } from "@/features/admin/vms/SnapshotGrid"

interface Snapshot {
  id: string
  item: string
  confidence: number
  location: string
  timestamp: string
  imageUrl: string
  severity: "low" | "medium" | "high"
}

// Static mockup data
const MOCK_SNAPSHOTS: Snapshot[] = [
  { id: "s1", item: "Backpack", confidence: 98, location: "CAM 01 - Engineering North", timestamp: "10:42 AM", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", severity: "high" },
  { id: "s2", item: "Hydro Flask", confidence: 92, location: "CAM 04 - Main Library", timestamp: "11:15 AM", imageUrl: "https://images.unsplash.com/photo-1602143307185-83e3125bb011?w=400&q=80", severity: "medium" },
  { id: "s3", item: "Laptop Bag", confidence: 89, location: "CAM 02 - Gymnasium", timestamp: "01:22 PM", imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80", severity: "low" },
  { id: "s4", item: "Smartphone", confidence: 96, location: "CAM 07 - Student Center", timestamp: "02:05 PM", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", severity: "high" },
  { id: "s5", item: "Umbrella", confidence: 87, location: "CAM 09 - Cafeteria", timestamp: "03:30 PM", imageUrl: "https://images.unsplash.com/photo-1520113204905-24e54854f3a7?w=400&q=80", severity: "low" },
  { id: "s6", item: "Key Ring", confidence: 94, location: "CAM 01 - Engineering North", timestamp: "04:12 PM", imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&q=80", severity: "high" },
]

export function SnapshotGalleryPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(MOCK_SNAPSHOTS)

  const handleReviewAction = (id: string, action: 'verify' | 'discard') => {
    setSnapshots(prev => prev.filter(s => s.id !== id))
    console.log(`Snapshot ${id} ${action === 'verify' ? 'verified' : 'discarded'}`)
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: '#F8FAFC',
      overflowX: 'hidden'
    }}>
      <div style={{ padding: '0 2rem' }}>
        <VMSHeader 
          title="AI Smart Event Gallery" 
          subtitle="Review and classify machine-learning detection events."
          pendingCount={snapshots.length}
        />
      </div>

      <main style={{ flex: 1, padding: '0 2rem 2rem 2rem', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'transparent', border: 'none' }}>
          <SnapshotGrid 
            snapshots={snapshots} 
            onReview={handleReviewAction} 
          />
        </div>
      </main>
    </div>
  )
}
