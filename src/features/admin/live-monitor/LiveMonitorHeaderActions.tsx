import { Select } from "@/components/ui/Select"

type LiveMonitorHeaderActionsProps = {
  filter: string
  uniqueLocations: string[]
  onFilterChange: (filter: string) => void
}

export function LiveMonitorHeaderActions({ filter, uniqueLocations, onFilterChange }: LiveMonitorHeaderActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={filter}
        onChange={(event) => onFilterChange(event.target.value)}
        className="h-9 w-40 text-xs font-semibold"
      >
        <option value="all">All Locations</option>
        {uniqueLocations.map((location) => (
          <option key={location} value={location}>{location}</option>
        ))}
      </Select>

      <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Active Monitoring
      </div>
    </div>
  )
}
