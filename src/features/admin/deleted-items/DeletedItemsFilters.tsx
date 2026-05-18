import { Button } from "@/components/ui/button"
import { AdminListFilters, AdminSearchInput } from "@/features/admin/components/admin-list-layout"

type DeletedItemsFiltersProps = {
  search: string
  itemCount: number
  onSearchChange: (value: string) => void
  onReset: () => void
}

export function DeletedItemsFilters({ search, itemCount, onSearchChange, onReset }: DeletedItemsFiltersProps) {
  return (
    <div className="space-y-3">
      <AdminListFilters>
        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search deleted items..."
        />
        <Button
          type="button"
          variant="outline"
          className="h-12 px-4 shadow-sm border-slate-200 text-slate-600 rounded-xl font-bold bg-white"
          disabled={!search}
          onClick={onReset}
        >
          Reset
        </Button>
      </AdminListFilters>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
        Showing {itemCount} deleted item{itemCount === 1 ? "" : "s"}
      </p>
    </div>
  )
}
