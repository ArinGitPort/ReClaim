import type { ReactNode } from "react"

type AdminListHeaderProps = {
  title: string
  description: string
  actions?: ReactNode
}

export function AdminListHeader({ title, description, actions }: AdminListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div> : null}
    </div>
  )
}
