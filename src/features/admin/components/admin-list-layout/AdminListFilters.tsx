import type { ReactNode } from "react"

type AdminListFiltersProps = {
  children: ReactNode
}

export function AdminListFilters({ children }: AdminListFiltersProps) {
  return <div className="flex flex-col md:flex-row gap-4">{children}</div>
}
