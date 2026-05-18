import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { AdminListFilters, AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import type { ConfidenceFilter } from "./types"

type SnapshotFiltersProps = {
  searchQuery: string
  locationFilter: string
  confidenceFilter: ConfidenceFilter
  uniqueLocations: string[]
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onLocationChange: (value: string) => void
  onConfidenceChange: (value: ConfidenceFilter) => void
  onReset: () => void
}

export function SnapshotFilters({
  searchQuery,
  locationFilter,
  confidenceFilter,
  uniqueLocations,
  hasActiveFilters,
  onSearchChange,
  onLocationChange,
  onConfidenceChange,
  onReset,
}: SnapshotFiltersProps) {
  return (
    <AdminListFilters>
      <AdminSearchInput
        placeholder="Search by predicted category..."
        value={searchQuery}
        onChange={onSearchChange}
      />

      <div className="w-full md:w-56">
        <Select
          value={locationFilter}
          onChange={(event) => onLocationChange(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
        >
          <option value="">All Locations</option>
          {uniqueLocations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </Select>
      </div>

      <div className="w-full md:w-56">
        <Select
          value={confidenceFilter}
          onChange={(event) => onConfidenceChange(event.target.value as ConfidenceFilter)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
        >
          <option value="">Any Confidence</option>
          <option value="high">&gt; 90% Confidence</option>
          <option value="medium">&gt; 75% Confidence</option>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600"
        disabled={!hasActiveFilters}
        onClick={onReset}
      >
        Reset
      </Button>
    </AdminListFilters>
  )
}
