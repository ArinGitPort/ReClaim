import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ModalHeaderProps = {
  title: string
  icon: React.ReactNode
  onClose: () => void
  subtitle?: string
  containerClassName?: string
  iconWrapperClassName?: string
  titleClassName?: string
  subtitleClassName?: string
  closeButtonClassName?: string
}

export function ModalHeader({
  title,
  icon,
  onClose,
  subtitle,
  containerClassName,
  iconWrapperClassName,
  titleClassName,
  subtitleClassName,
  closeButtonClassName,
}: ModalHeaderProps) {
  return (
    <div className={cn("p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50", containerClassName)}>
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm", iconWrapperClassName)}>
          {icon}
        </div>
        <div>
          <h2 className={cn("text-lg font-extrabold text-brand uppercase tracking-tight", titleClassName)}>{title}</h2>
          {subtitle && <p className={cn("text-[11px] font-bold text-slate-400 mt-1", subtitleClassName)}>{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className={cn("p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors", closeButtonClassName)}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
