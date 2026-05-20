import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/button"
import type { AiServiceStatus } from "./types"

type LiveMonitorHeaderActionsProps = {
  filter: string
  uniqueLocations: string[]
  aiService: AiServiceStatus | null
  isAiServiceUpdating: boolean
  onFilterChange: (filter: string) => void
  onToggleAiService: (running: boolean) => void
}

export function LiveMonitorHeaderActions({
  filter,
  uniqueLocations,
  aiService,
  isAiServiceUpdating,
  onFilterChange,
  onToggleAiService,
}: LiveMonitorHeaderActionsProps) {
  const isRunning = Boolean(aiService?.running)

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
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

      <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border ${
        isRunning ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"
      }`}>
        <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
        {isRunning ? "Camera Service Online" : "Camera Service Off"}
      </div>

      <Button
        type="button"
        disabled={isAiServiceUpdating}
        onClick={() => onToggleAiService(!isRunning)}
        className={`h-9 px-4 text-xs font-bold uppercase tracking-widest rounded-xl ${
          isRunning
            ? "bg-white border border-rose-200 text-rose-600 hover:bg-rose-50"
            : "bg-brand text-white hover:bg-brand-active"
        }`}
      >
        {isAiServiceUpdating ? "Updating..." : isRunning ? "Stop Camera Service" : "Start Camera Service"}
      </Button>
    </div>
  )
}
