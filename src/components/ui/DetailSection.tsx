import React from 'react'

export function DetailSection({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.625rem', 
          backgroundColor: 'rgba(30, 47, 133, 0.05)', 
          marginLeft: '-0.75rem', 
          marginRight: '-0.75rem', 
          paddingLeft: '0.75rem', 
          paddingRight: '0.75rem', 
          paddingTop: '0.25rem', 
          paddingBottom: '0.25rem', 
          borderRadius: '0.5rem', 
          width: 'fit-content' 
        }}
      >
        {icon || <div style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', backgroundColor: '#1E2F85' }} />}
        <h5 
          style={{ 
            fontSize: '11px', 
            fontWeight: '800', 
            color: '#1E2F85', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em', 
            margin: 0 
          }}
        >
          {title}
        </h5>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>{children}</div>
    </div>
  )
}
