import React from 'react'

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
  const buttonStyles: React.CSSProperties = {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    ...style
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        style={buttonStyles}
      >
        {icon}
      </button>
    </div>
  )
}
