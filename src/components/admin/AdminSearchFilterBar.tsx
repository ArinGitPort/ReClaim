import React from "react"

interface AdminSearchFilterBarProps {
  children: React.ReactNode
}

export function AdminSearchFilterBar({ children }: AdminSearchFilterBarProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '0.75rem' 
    }}>
      {children}
    </div>
  )
}
