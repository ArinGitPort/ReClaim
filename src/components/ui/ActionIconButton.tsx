import React from 'react'
import { cn } from "@/lib/utils"

export function ActionIconButton({
  label,
  icon,
  buttonClassName,
  onClick,
  disabled
}: {
  label: string
  icon: React.ReactNode
  buttonClassName?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="relative group/action">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "w-9 h-9 rounded-lg border flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          buttonClassName
        )}
      >
        {icon}
      </button>
      <span className="pointer-events-none absolute bottom-full right-0 mb-2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-extrabold text-white opacity-0 translate-y-1 transition-all group-hover/action:opacity-100 group-hover/action:translate-y-0 whitespace-nowrap z-50">
        {label}
      </span>
    </div>
  )
}
