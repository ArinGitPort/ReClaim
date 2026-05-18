import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center", className)}>
      {icon && <div className="mb-3 flex justify-center text-slate-300">{icon}</div>}
      <p className="text-sm font-bold text-slate-500">{title}</p>
      {description && <p className="mt-1 text-xs font-semibold text-slate-400">{description}</p>}
    </div>
  )
}
