import type { CapturedItem } from "@/data/mockData"
import { X, Send, MapPin, Tag, Info, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface ReviewItemModalProps {
  item: CapturedItem
  onClose: () => void
  onPublish: () => void
}

export function ReviewItemModal({ item, onClose, onPublish }: ReviewItemModalProps) {
  const [title, setTitle] = useState(`${item.aiPrediction} found at ${item.suggestedLocation}`)
  const [category, setCategory] = useState(item.aiPrediction)
  const [description, setDescription] = useState("")
  const [storageLocation, setStorageLocation] = useState("")

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Backdrop */}
      <div 
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }} 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div style={{ position: 'relative', backgroundColor: '#FFFFFF', width: '100%', maxWidth: '64rem', height: '90vh', borderRadius: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        
        {/* Left Side: Photo Preview */}
        <div style={{ flex: 1, backgroundColor: '#F1F5F9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <img src={item.imageUrl} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent, transparent)', pointerEvents: 'none' }} />
           <div style={{ position: 'absolute', bottom: '2rem', left: '2rem' }}>
              <span style={{ padding: '0.375rem 1rem', backgroundColor: '#4F46E5', color: '#FFFFFF', borderRadius: '9999px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                AI Original Perspective
              </span>
           </div>
        </div>

        {/* Right Side: Form & Actions */}
        <div style={{ flex: 1, padding: '3rem', overflowY: 'auto', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
           <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Review Capture</h2>
                <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.875rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Validate and publish this item to the gallery.</p>
              </div>
              <button 
                onClick={onClose}
                style={{ display: 'flex', padding: '0.5rem', backgroundColor: '#F8FAFC', border: 'none', borderRadius: '9999px', cursor: 'pointer' }}
              >
                <X style={{ width: '1.5rem', height: '1.5rem', color: '#94A3B8' }} />
              </button>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
              {/* Field: Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <label style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info style={{ width: '0.875rem', height: '0.875rem' }} />
                    Item Title
                 </label>
                 <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0', borderBottom: '2px solid #F1F5F9', backgroundColor: 'transparent', outline: 'none', fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', border: 'none', borderBottomStyle: 'solid', boxSizing: 'border-box' }}
                    placeholder="e.g. Silver Laptop with Blue Sticker"
                 />
              </div>

              {/* Grid: Category & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <Tag style={{ width: '0.875rem', height: '0.875rem' }} />
                       Category
                    </label>
                    <select 
                       value={category}
                       onChange={(e) => setCategory(e.target.value)}
                       style={{ width: '100%', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', border: 'none', outline: 'none' }}
                    >
                       <option>Electronics</option>
                       <option>Wallets/IDs</option>
                       <option>Keys</option>
                       <option>Others</option>
                    </select>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
                       Found Location
                    </label>
                    <input 
                       type="text" 
                       value={item.suggestedLocation}
                       readOnly
                       style={{ width: '100%', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#94A3B8', border: 'none', outline: 'none' }}
                    />
                 </div>
              </div>

              {/* Field: Storage Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <label style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck style={{ width: '0.875rem', height: '0.875rem' }} />
                    Physical Storage Location
                 </label>
                 <input 
                    type="text" 
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', border: 'none', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="e.g. Cabinet B, Shelf 3"
                 />
              </div>

              {/* Field: Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <label style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Condition / Notes</label>
                 <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', border: 'none', outline: 'none', height: '8rem', resize: 'none', boxSizing: 'border-box' }}
                    placeholder="Add specific details about the item's condition..."
                 />
              </div>
           </div>

           <div style={{ paddingTop: '2.5rem', display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <Button 
                variant="outline" 
                onClick={onClose}
                style={{ flex: 1, height: '3.5rem', borderRadius: '1rem', border: '2px solid #E2E8F0', fontWeight: 700, color: '#64748B' }}
              >
                Discard Capture
              </Button>
              <Button 
                onClick={onPublish}
                style={{ flex: 2, height: '3.5rem', borderRadius: '1rem', backgroundColor: '#4F46E5', color: '#FFFFFF', fontWeight: 700, boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: 'none', cursor: 'pointer' }}
              >
                <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                Publish to Inventory
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
