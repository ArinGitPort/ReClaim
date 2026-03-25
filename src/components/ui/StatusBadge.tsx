import React from 'react'

export function StatusBadge({ status, weight }: { status?: string; weight?: number }) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    border: '1px solid transparent',
    textTransform: 'uppercase',
  }

  if (weight !== undefined) {
    let weightStyles: React.CSSProperties = {}
    if (weight >= 80) {
      weightStyles = { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }
    } else if (weight >= 50) {
      weightStyles = { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }
    } else {
      weightStyles = { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fecdd3' }
    }

    return (
      <span style={{ ...baseStyles, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', borderStyle: 'solid', ...weightStyles }}>
        {weight}% MATCH
      </span>
    )
  }

  if (!status) return null

  const label = status === "CLAIM_PENDING" ? "CLAIM PENDING" : status.replaceAll("_", " ")

  const getStatusStyles = (): React.CSSProperties => {
    switch(status) {
      case 'AVAILABLE': 
      case 'Ready for Pickup':
        return { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#d1fae5' }
      case 'ACTIVE_SEARCH': 
        return { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#d1fae5', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }
      case 'CLAIM_PENDING': 
        return { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }
      case 'MATCHED': 
        return { backgroundColor: '#eef2ff', color: '#4338ca', borderColor: '#e0e7ff' }
      case 'SUBMITTED': 
        return { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#dbeafe' }
      case 'RETURNED': 
      case 'Closed - Picked Up':
      case 'Closed - Rejected':
        return { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#f1f5f9' }
      case 'RESOLVED':
        return { backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#e2e8f0' }
      case 'ARCHIVED': 
      case 'REJECTED':
      case 'Inquiry Required':
        return { backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#ffe4e6' }
      case 'PENDING_REVIEW':
      case 'UNDER_REVIEW':
      case 'Pending Verification':
        return { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fef3c7' }
      default: return { backgroundColor: '#f8fafc', color: '#334155', borderColor: '#f1f5f9' }
    }
  }

  return (
    <span style={{ 
      ...baseStyles, 
      padding: '0.375rem 0.75rem', 
      borderRadius: '9999px', 
      borderStyle: 'solid', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
      gap: '0.5rem',
      ...getStatusStyles() 
    }}>
      {status === 'CLAIM_PENDING' && (
        <div style={{ 
          width: '0.375rem', 
          height: '0.375rem', 
          borderRadius: '9999px', 
          backgroundColor: '#f59e0b' 
        }} />
      )}
      {label}
    </span>
  )
}
