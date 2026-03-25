import { SnapshotCard } from "./SnapshotCard"
import { Search } from "lucide-react"

interface Snapshot {
  id: string
  item: string
  confidence: number
  location: string
  timestamp: string
  imageUrl: string
  severity: "low" | "medium" | "high"
}

interface SnapshotGridProps {
  snapshots: Snapshot[]
  onReview: (id: string, action: 'verify' | 'discard') => void
}

export function SnapshotGrid({ snapshots, onReview }: SnapshotGridProps) {
  return (
    <div style={{ padding: '2.5rem' }}>
      {snapshots.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '8rem 0',
          color: '#94A3B8'
        }}>
          <div style={{ 
            width: '4rem', 
            height: '4rem', 
            backgroundColor: '#F1F5F9', 
            borderRadius: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <Search style={{ width: '2rem', height: '2rem', color: '#CBD5E1' }} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#475569', margin: '0 0 0.5rem 0' }}>Review Queue Clear</h3>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B' }}>Awaiting new detections from AI Smart Nodes.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
          gap: '2.5rem' 
        }}>
          {snapshots.map(snap => (
            <SnapshotCard 
              key={snap.id} 
              snapshot={snap} 
              onReview={onReview} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
