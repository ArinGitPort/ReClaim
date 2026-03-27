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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '0.5rem',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style
      }}
    >
      {icon}
    </button>
  )
}
