import React from 'react'
export function DataRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{}}>
      <div 
        style={{ 
          fontSize: '10px', 
          fontWeight: 'bold', 
          color: '#94A3B8', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          marginBottom: '0.375rem', 
          lineHeight: '1' 
        }}
      >
        {label}
      </div>
      <div 
        style={{ 
          fontSize: '15px', 
          fontWeight: 'bold', 
          color: '#1E293B', 
          letterSpacing: '-0.025em',
          ...(mono ? { 
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            letterSpacing: '-0.05em'
          } : {})
        }}
      >
        {value}
      </div>
    </div>
  )
}
