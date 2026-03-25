import { useState } from "react"
import { X, Save, Edit2, MapPin, Tag, Info, ShieldCheck, Archive } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface EditInventoryItemModalProps {
  item: any
  onClose: () => void
  onSaved: () => void
}

export function EditInventoryItemModal({ item, onClose, onSaved }: EditInventoryItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [status, setStatus] = useState(item.status)

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

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    outline: 'none'
  }

  const editableInputStyle: React.CSSProperties = {
    ...inputBaseStyle,
    backgroundColor: '#F8FAFC',
    color: '#1E293B'
  }

  const readOnlyInputStyle: React.CSSProperties = {
    ...inputBaseStyle,
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
    cursor: 'not-allowed'
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Edit2 style={{ width: '1.25rem', height: '1.25rem', color: '#1E2F85' }} />
            Edit Item Record
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace', margin: '0.25rem 0 0 0' }}>ID: {item.code}</p>
        </div>
        <button onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>
              <Info style={{ width: '0.875rem', height: '0.875rem' }} /> Item Title
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={editableInputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>
                <Tag style={{ width: '0.875rem', height: '0.875rem' }} /> Operational Status
              </label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...editableInputStyle, appearance: 'none' }}
              >
                <option value="AVAILABLE">Available</option>
                <option value="CLAIM_PENDING">Claim Pending</option>
                <option value="RETURNED">Returned</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>
                <Archive style={{ width: '0.875rem', height: '0.875rem' }} /> Category
              </label>
              <input 
                type="text" 
                value={item.category}
                readOnly
                style={readOnlyInputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>
              <MapPin style={{ width: '0.875rem', height: '0.875rem' }} /> Found Location
            </label>
            <input 
              type="text" 
              value={item.location}
              readOnly
              style={readOnlyInputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>
              <ShieldCheck style={{ width: '0.875rem', height: '0.875rem' }} /> Storage Facility
            </label>
            <input 
              type="text" 
              defaultValue={item.storage}
              style={editableInputStyle}
              placeholder="e.g. Shelf 4"
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
              Update Record
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

