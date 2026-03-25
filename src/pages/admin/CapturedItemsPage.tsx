import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { CapturedItem } from "@/data/mockData"
import { Inbox, Clock, Bot, CheckCircle, ArrowRight, Camera as CameraIcon } from "lucide-react"
import { ReviewItemModal } from "../../components/admin/ReviewItemModal"
import { SmartSnapCamera } from "../../components/admin/SmartSnapCamera"

export function CapturedItemsPage() {
  const [items, setItems] = useState<CapturedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<CapturedItem | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const loadCapturedItems = async () => {
    setIsLoading(true)
    try {
      const response = await api.get<CapturedItem[]>("/admin/captured-items")
      setItems(response.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCapturedItems()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Captured Items Inbox</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Review items automatically detected by AI cameras.</p>
        </div>
        <button 
          onClick={() => setShowCamera(!showCamera)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#1E2F85', color: '#FFFFFF', borderRadius: '1rem', fontWeight: 700, fontSize: '0.875rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(30, 47, 133, 0.2)', cursor: 'pointer' }}
        >
          {showCamera ? <Inbox style={{ width: '1.25rem', height: '1.25rem' }} /> : <CameraIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
          {showCamera ? "View Inbox" : "Live AI Camera"}
        </button>
      </div>

      {showCamera ? (
        <SmartSnapCamera onCapture={loadCapturedItems} />
      ) : (
        <>
          {isLoading ? (
            <div style={{ padding: '6rem', textAlign: 'center' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', border: '4px solid #1E2F85', borderTopColor: 'transparent', borderRadius: '9999px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', margin: 0 }}>Syncing with AI Nodes...</p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1.5rem', padding: '6rem', border: '1px dashed #E2E8F0', textAlign: 'center' }}>
               <div style={{ width: '5rem', height: '5rem', backgroundColor: '#F8FAFC', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1.5rem' }}>
                 <CheckCircle style={{ width: '2.5rem', height: '2.5rem', color: '#E2E8F0' }} />
               </div>
               <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Inbox is Clear</h3>
               <p style={{ color: '#94A3B8', fontWeight: 500, marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>No new items have been captured recently.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
              {items.map((item) => (
                <div 
                  key={item.id} 
                  style={{ backgroundColor: '#FFFFFF', borderRadius: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                    <img src={item.imageUrl} alt="Captured Item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                       <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, color: '#1E2F85', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>
                         <Bot style={{ width: '0.75rem', height: '0.75rem' }} />
                         AI Guess: {item.aiPrediction}
                       </span>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#94A3B8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.confidence * 100}% Fit</span>
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 1rem 0' }}>Detected at {item.suggestedLocation}</h4>
                    <button style={{ width: '100%', padding: '0.625rem 0', backgroundColor: '#F8FAFC', color: '#475569', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      Review & Publish
                      <ArrowRight style={{ width: '0.875rem', height: '0.875rem' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedItem && (
        <ReviewItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onPublish={() => {
            setSelectedItem(null)
            loadCapturedItems()
          }}
        />
      )}
    </div>
  )
}
