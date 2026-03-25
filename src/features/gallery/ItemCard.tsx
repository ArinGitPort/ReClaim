import React, { useState } from "react"
import { ShieldAlert, Laptop, MapPin, CalendarClock } from "lucide-react"
import { ClaimThisItemModal } from "@/features/claims/ClaimThisItemModal"

export interface FoundItem {
  id: string
  title: string
  category: string
  location: string
  dateLost: string
  isHighValue: boolean
  imageUrl?: string
}

interface ItemCardProps {
  item: FoundItem
}

export function ItemCard({ item }: ItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const cardStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
  }

  const imageContainerStyles: React.CSSProperties = {
    height: '12rem',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }

  const highValueBadgeStyles: React.CSSProperties = {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    backgroundColor: 'rgba(30, 47, 133, 0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(30, 47, 133, 0.2)',
    padding: '0.25rem 0.625rem',
    borderRadius: '0.25rem',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#1E2F85',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  }

  const contentBodyStyles: React.CSSProperties = {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0%',
  }

  const titleStyles: React.CSSProperties = {
    fontWeight: 'bold',
    color: '#0F172A',
    fontSize: '1.125rem',
    lineHeight: '1.25',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }

  const claimButtonStyles: React.CSSProperties = {
    marginTop: 'auto',
    width: '100%',
    padding: '0.625rem 0',
    backgroundColor: '#1E2F85',
    color: '#FFFFFF',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  }

  return (
    <>
      <div style={cardStyles}>
        {/* Visual Header */}
        <div style={imageContainerStyles}>
          {item.isHighValue ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: 0.7 }}>
              <Laptop style={{ width: '4rem', height: '4rem', marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1E2F85' }}>Secure Match required</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>No Image Provided</span>
            </div>
          )}
          
          {/* High Value Badge overlay */}
          {item.isHighValue && (
            <div style={highValueBadgeStyles}>
              <ShieldAlert style={{ width: '0.75rem', height: '0.75rem' }} />
              HIGH VALUE
            </div>
          )}
        </div>

        {/* Content Body */}
        <div style={contentBodyStyles}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3 style={titleStyles}>
              {item.title}
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748B' }}>
              <MapPin style={{ width: '1rem', height: '1rem', color: 'rgba(30, 47, 133, 0.7)' }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748B' }}>
              <CalendarClock style={{ width: '1rem', height: '1rem', color: 'rgba(30, 47, 133, 0.7)' }} />
              <span>{new Date(item.dateLost).toLocaleDateString()}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            style={claimButtonStyles}
          >
            Claim This Item
          </button>
        </div>
      </div>

      <ClaimThisItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        itemId={item.id}
        itemTitle={item.title}
        itemCategory={item.category}
      />
    </>
  )
}
