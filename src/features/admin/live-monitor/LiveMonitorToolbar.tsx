import { LayoutGrid, MonitorPlay } from "lucide-react"
import type { LiveMonitorViewMode } from "./types"

type LiveMonitorToolbarProps = {
  viewMode: LiveMonitorViewMode
  time: string
  onViewModeChange: (mode: LiveMonitorViewMode) => void
}

export function LiveMonitorToolbar({ viewMode, time, onViewModeChange }: LiveMonitorToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2 sm:p-3 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-3 px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:inline-block">Layout:</span>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onViewModeChange("focus")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "focus" ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700"}`}
            title="Single Camera Focus"
          >
            <MonitorPlay className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700"}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest flex items-center gap-2">
        <span>SYS_TIME: {time}</span>
      </div>
    </div>
  )
}
