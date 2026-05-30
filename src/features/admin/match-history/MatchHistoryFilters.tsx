import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { AdminListFilters, AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import { ITEM_CATEGORIES } from "@/features/shared/constants"

type MatchHistoryFiltersProps = {
  search: string
  categoryFilter: string
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onReset: () => void
}

export function MatchHistoryFilters({
  search,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
  onReset,
}: MatchHistoryFiltersProps) {
  return (
    <AdminListFilters>
      <AdminSearchInput
        placeholder="Search matches by report code, student name, or item title..."
        value={search}
        onChange={onSearchChange}
      />
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
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={!search && !categoryFilter}
        className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600 disabled:opacity-50"
      >
        <Filter className="w-4 h-4 mr-2" /> Reset
      </Button>
    </AdminListFilters>
  )
}
