import * as React from "react"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ style, type, disabled, ...props }, ref) => {
    const inputStyles: React.CSSProperties = {
      display: 'flex',
      height: '2.25rem',
      width: '100%',
      borderRadius: '0.375rem',
      border: '1px solid #E2E8F0',
      backgroundColor: 'transparent',
      padding: '0.25rem 0.75rem',
      fontSize: '0.875rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      outline: 'none',
      color: '#0F172A',
      ...(disabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}),
      ...style,
    }

    return (
      <input
        type={type}
        style={inputStyles}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
