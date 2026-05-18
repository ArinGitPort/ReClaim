import { AdminListFilters, AdminSearchInput } from "@/features/admin/components/admin-list-layout"

type CameraSettingsFiltersProps = {
  searchQuery: string
  visibleCount: number
  onSearchChange: (value: string) => void
}

export function CameraSettingsFilters({ searchQuery, visibleCount, onSearchChange }: CameraSettingsFiltersProps) {
  return (
    <div className="space-y-3">
      <AdminListFilters>
        <AdminSearchInput
          placeholder="Search by camera name, ID, or location..."
          value={searchQuery}
          onChange={onSearchChange}
        />
      </AdminListFilters>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
        Showing {visibleCount} camera{visibleCount === 1 ? "" : "s"}
      </p>
    </div>
  )
}
