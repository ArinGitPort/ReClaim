import * as React from "react"

const selectBaseStyles: React.CSSProperties = {
  display: 'flex',
  height: '2.25rem',
  width: '100%',
  borderRadius: '0.375rem',
  border: '1px solid #E2E8F0',
  backgroundColor: '#FFFFFF',
  paddingLeft: '0.75rem',
  paddingRight: '2rem', // Space for the arrow
  paddingTop: '0.25rem',
  paddingBottom: '0.25rem',
  fontSize: '0.875rem',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  outline: 'none',
  appearance: 'none',
  color: '#0F172A',
  boxSizing: 'border-box',
}

const selectWrapperStyles: React.CSSProperties = {
  position: 'relative'
}

const selectArrowWrapperStyles: React.CSSProperties = {
  position: 'absolute', 
  top: 0, 
  bottom: 0, 
  right: 0, 
  display: 'flex', 
  alignItems: 'center', 
  paddingRight: '0.75rem', 
  pointerEvents: 'none', 
  color: '#64748B' 
}

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ style, children, disabled, ...props }, ref) => {
    const combinedStyle: React.CSSProperties = {
      ...selectBaseStyles,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style,
    }

    return (
      <div style={selectWrapperStyles}>
        <select
          style={combinedStyle}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        <div style={selectArrowWrapperStyles}>
          <svg
            style={{ height: '1rem', width: '1rem' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
