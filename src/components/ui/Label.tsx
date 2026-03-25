import * as React from "react"

const labelBaseStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  lineHeight: '1',
  color: '#0F172A',
}

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ style, ...props }, ref) => {
    return (
      <label
        ref={ref}
        style={{ ...labelBaseStyles, ...style }}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }
