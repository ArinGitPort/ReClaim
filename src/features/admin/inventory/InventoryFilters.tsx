import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { AdminListFilters, AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import { ITEM_CATEGORIES } from "@/features/shared/constants"

type InventoryFiltersProps = {
  search: string
  statusFilter: string
  categoryFilter: string
  statusOptions: string[]
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onReset: () => void
}

export function InventoryFilters({
  search,
  statusFilter,
  categoryFilter,
  statusOptions,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onReset,
}: InventoryFiltersProps) {
  return (
    <AdminListFilters>
      <AdminSearchInput
        placeholder="Search by Item ID, Title, or Description..."
        value={search}
        onChange={onSearchChange}
      />
      <div className="w-full md:w-52">
        <Select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
          ))}
        </Select>
      </div>
      <div className="w-full md:w-52">
        <Select
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
        >
          <option value="">All Categories</option>
          {ITEM_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
      </div>
      <Button
        variant="outline"
        onClick={onReset}
        className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600"
      >
        <Filter className="w-4 h-4 mr-2" /> Reset
      </Button>
    </AdminListFilters>
  )
}
