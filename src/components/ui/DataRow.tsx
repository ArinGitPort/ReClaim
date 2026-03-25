import React from 'react'
const labelStyles: React.CSSProperties = {
  fontSize: '10px', 
  fontWeight: 'bold', 
  color: '#94A3B8', 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  marginBottom: '0.375rem', 
  lineHeight: '1' 
}

const valueBaseStyles: React.CSSProperties = {
  fontSize: '15px', 
  fontWeight: 'bold', 
  color: '#1E293B', 
  letterSpacing: '-0.025em',
}

const monoStyles: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  letterSpacing: '-0.05em'
}

export function DataRow({ label, value, mono, style }: { label: string; value: React.ReactNode; mono?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={labelStyles}>
        {label}
      </div>
      <div 
        style={{ 
          ...valueBaseStyles,
          ...(mono ? monoStyles : {})
        }}
      >
        {value}
      </div>
    </div>
  )
}
