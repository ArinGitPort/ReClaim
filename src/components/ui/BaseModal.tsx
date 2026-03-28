import React from "react"
import { X } from "lucide-react"

interface BaseModalProps {
  children: React.ReactNode
  onClose: () => void
  maxWidth?: string
  title?: string
  id?: string
}

export function BaseModal({ children, onClose, maxWidth = '48rem', title, id }: BaseModalProps) {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 100, 
      display: 'flex', 
      alignItems: 'flex-start', 
      justifyContent: 'center', 
      overflowY: 'auto', 
      padding: '2.5rem 1rem' 
    }}>
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.8)' 
      }} onClick={onClose} />
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: maxWidth, 
        backgroundColor: '#FFFFFF', 
        borderRadius: '0.75rem', 
        overflow: 'hidden', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
        border: '1px solid #E2E8F0', 
        margin: 'auto' 
      }}>
        {(title || id) && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            borderBottom: '1px solid #F1F5F9', 
            backgroundColor: 'rgba(248, 250, 252, 0.7)', 
            padding: '1rem 1.5rem' 
          }}>
            <div>
              {title && (
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '-0.025em', 
                  color: '#0F172A', 
                  margin: 0 
                }}>
                  {title}
                </h3>
              )}
              {id && (
                <p style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: '#94A3B8', 
                  margin: 0 
                }}>
                  {id}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ 
                borderRadius: '9999px', 
                padding: '0.5rem', 
                color: '#94A3B8', 
                backgroundColor: 'transparent', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
