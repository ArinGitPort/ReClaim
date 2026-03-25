import React from 'react'

const actionButtonBaseStyles: React.CSSProperties = {
  width: '2.25rem',
  height: '2.25rem',
  borderRadius: '0.5rem',
  border: '1px solid #E2E8F0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFFFFF',
  outline: 'none',
}

export function ActionIconButton({
  label,
  icon,
  onClick,
  disabled,
  style
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const combinedStyle: React.CSSProperties = {
    ...actionButtonBaseStyles,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...style
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={combinedStyle}
    >
      {icon}
    </button>
  )
}
