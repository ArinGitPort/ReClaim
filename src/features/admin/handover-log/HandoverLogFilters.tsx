import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { AdminListFilters, AdminSearchInput } from "@/features/admin/components/admin-list-layout"

type HandoverLogFiltersProps = {
  search: string
  sourceFilter: string
  sourceOptions: Array<{ label: string; value: string }>
  onSearchChange: (value: string) => void
  onSourceChange: (value: string) => void
  onReset: () => void
}

export function HandoverLogFilters({ search, sourceFilter, sourceOptions, onSearchChange, onSourceChange, onReset }: HandoverLogFiltersProps) {
  return (
    <AdminListFilters>
      <AdminSearchInput value={search} onChange={onSearchChange} placeholder="Search by source code, item, inventory code, or token" />

      <div className="w-full lg:w-56">
        <Select
          value={sourceFilter}
          onChange={(event) => onSourceChange(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
        >
          <option value="">All Statuses</option>
          {sourceOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600"
        disabled={!search.length && !sourceFilter.length}
        onClick={onReset}
      >
        Reset
      </Button>
    </AdminListFilters>
  )
}
