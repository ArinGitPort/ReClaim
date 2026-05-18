import { Button } from "@/components/ui/button"
import { AdminListFilters, AdminSearchInput } from "@/features/admin/components/admin-list-layout"

type ExpiredInventoryFiltersProps = {
  searchQuery: string
  itemCount: number
  onSearchChange: (value: string) => void
  onReset: () => void
}

export function ExpiredInventoryFilters({ searchQuery, itemCount, onSearchChange, onReset }: ExpiredInventoryFiltersProps) {
  return (
    <div className="space-y-3">
      <AdminListFilters>
        <AdminSearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search expired items..."
        />

        <div className="w-full md:w-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-4 shadow-sm border-slate-200 text-slate-600 rounded-xl font-bold bg-white"
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </AdminListFilters>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
        Showing {itemCount} expired item{itemCount === 1 ? "" : "s"}
      </p>
    </div>
  )
}
