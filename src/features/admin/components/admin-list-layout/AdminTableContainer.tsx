import type { ReactNode } from "react"

type AdminTableContainerProps = {
  children: ReactNode
}

export function AdminTableContainer({ children }: AdminTableContainerProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto overflow-y-hidden">{children}</div>
    </div>
  )
}
