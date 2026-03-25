import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

const buttonBaseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  whiteSpace: 'nowrap',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: '#1E2F85',
    color: '#FFFFFF',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  destructive: {
    backgroundColor: '#E11D48',
    color: '#FFFFFF',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  outline: {
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  secondary: {
    backgroundColor: '#F1F5F9',
    color: '#0F172A',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'inherit',
  },
  link: {
    backgroundColor: 'transparent',
    color: '#1E2F85',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
  },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  default: {
    height: '2.25rem',
    padding: '0.5rem 1rem',
  },
  sm: {
    height: '2rem',
    borderRadius: '0.375rem',
    padding: '0 0.75rem',
    fontSize: '0.75rem',
  },
  lg: {
    height: '2.5rem',
    borderRadius: '0.375rem',
    padding: '0 2rem',
  },
  icon: {
    height: '2.25rem',
    width: '2.25rem',
  },
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ style, variant = "default", size = "default", asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const combinedStyle: React.CSSProperties = {
      ...buttonBaseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}),
      ...style,
    }

    return (
      <Comp
        style={combinedStyle}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
