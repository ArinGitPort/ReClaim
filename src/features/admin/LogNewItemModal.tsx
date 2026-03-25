import { useState } from "react"
import { X, Save, Camera, MapPin, Tag, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface LogNewItemModalProps {
  onClose: () => void
  onSaved: () => void
}

export function LogNewItemModal({ onClose, onSaved }: LogNewItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onSaved()
    }, 800)
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 900,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.375rem'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#F8FAFC',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#1E293B',
    outline: 'none'
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Log Physical Discovery</h2>
          <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '500', margin: 0 }}>Securly register a newly found item into the campus inventory.</p>
        </div>
        <button onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Photo Upload Placeholder */}
        <div style={{ aspectRatio: '16 / 9', backgroundColor: '#F8FAFC', border: '2px dashed #E2E8F0', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
           <div style={{ width: '3rem', height: '3rem', backgroundColor: '#FFFFFF', borderRadius: '50%', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Camera style={{ width: '1.5rem', height: '1.5rem', color: '#94A3B8' }} />
           </div>
           <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8', margin: 0 }}>Upload Item Evidence</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>
              <Info style={{ width: '0.875rem', height: '0.875rem' }} /> Item Title
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Blue HydroFlask with stickers"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>
                <Tag style={{ width: '0.875rem', height: '0.875rem' }} /> Category
              </label>
              <select style={{ ...inputStyle, appearance: 'none' }}>
                <option>Electronics</option>
                <option>Water Bottles</option>
                <option>Clothing</option>
                <option>Wallets/IDs</option>
                <option>Keys</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>
                <MapPin style={{ width: '0.875rem', height: '0.875rem' }} /> Found Location
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Library Level 2"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>
              <ShieldCheck style={{ width: '0.875rem', height: '0.875rem' }} /> Physical Storage Location
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Cabinet A, Shelf 3"
              style={inputStyle}
            />
          </div>
        </div>
      </form>

      <div style={{ padding: '1.5rem', borderTop: '1px solid #F1F5F9', backgroundColor: 'rgba(248, 250, 252, 0.5)', display: 'flex', gap: '0.75rem' }}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          style={{ flex: 1, height: '3rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontWeight: 'bold', color: '#64748B', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ 
            flex: 2, 
            height: '3rem', 
            borderRadius: '0.75rem', 
            backgroundColor: '#1E2F85', 
            color: '#FFFFFF', 
            fontWeight: 'bold', 
            boxShadow: '0 10px 15px -3px rgba(30, 47, 133, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? (
            <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%' }} />
          ) : (
            <>
              <Save style={{ width: '1rem', height: '1rem' }} />
              Commit to Inventory
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

