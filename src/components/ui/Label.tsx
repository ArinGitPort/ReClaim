import * as React from "react"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ style, ...props }, ref) => {
    const labelStyles: React.CSSProperties = {
      fontSize: '0.875rem',
      fontWeight: '600',
      lineHeight: '1',
      color: '#0F172A',
      ...style,
    }

    return (
      <label
        ref={ref}
        style={labelStyles}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }
