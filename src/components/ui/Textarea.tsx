import * as React from "react"

const textareaBaseStyles: React.CSSProperties = {
  display: 'flex',
  minHeight: '5rem',
  width: '100%',
  borderRadius: '0.375rem',
  border: '1px solid #E2E8F0',
  backgroundColor: 'transparent',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  outline: 'none',
  color: '#0F172A',
  boxSizing: 'border-box',
}

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ style, disabled, ...props }, ref) => {
    const combinedStyle: React.CSSProperties = {
      ...textareaBaseStyles,
      ...(disabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}),
      ...style,
    }

    return (
      <textarea
        style={combinedStyle}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
