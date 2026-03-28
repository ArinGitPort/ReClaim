import React from "react"

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      gap: '1rem', 
      marginBottom: '2rem' 
    }}>
      <div>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 800, 
          color: '#0F172A', 
          letterSpacing: '-0.025em', 
          margin: 0 
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ 
            color: '#64748B', 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            marginTop: '0.25rem', 
            margin: '0.25rem 0 0 0' 
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {actions}
        </div>
      )}
    </div>
  )
}
