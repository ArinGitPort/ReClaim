import { Camera, Clock, MapPin, Trash2 } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { formatCompactDateTime, formatShortDate } from "@/lib/formatters"
import {
  getConfidenceBadgeClass,
  getSnapshotCategory,
  getSnapshotConfidence,
  getSnapshotLocation,
  getSnapshotReasonLabels,
} from "./snapshotUtils"
import type { AISnapshot } from "./types"

type SnapshotGridProps = {
  snapshots: AISnapshot[]
  variant?: "active" | "dismissed"
  onSelect: (snapshot: AISnapshot) => void
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

export function SnapshotGrid({ snapshots, variant = "active", onSelect, selectedIds, onToggleSelect }: SnapshotGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {snapshots.map((snapshot) => {
        const confidence = getSnapshotConfidence(snapshot)
        const reasonLabels = getSnapshotReasonLabels(snapshot)
        const isSelected = selectedIds?.has(snapshot.id) ?? false

        return (
          <button
            key={snapshot.id}
            type="button"
            onClick={() => onSelect(snapshot)}
            className={`text-left bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col relative ${
              isSelected ? "border-brand ring-2 ring-brand/10" : "border-slate-200"
            } ${
              variant === "dismissed" ? "opacity-80 hover:opacity-100" : ""
            }`}
          >
            <div className="w-full h-32 bg-slate-100 border-b border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group-hover:opacity-90 transition-opacity">
              {onToggleSelect && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleSelect(snapshot.id)
                  }}
                  className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center border transition-all z-20 cursor-pointer shadow-sm ${
                    isSelected
                      ? "bg-brand border-brand text-white scale-105"
                      : "bg-white/80 hover:bg-white border-slate-300 hover:border-slate-400 text-transparent"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {snapshot.snapshotPath ? (
                <img src={getImageUrl(snapshot.snapshotPath)} alt="Snapshot" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">No Preview</span>
                </>
              )}

              <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded shadow-sm text-[8px] font-extrabold uppercase tracking-widest border ${getConfidenceBadgeClass(confidence)}`}>
                {confidence}% Match
              </div>

              {variant === "dismissed" && (
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[8px] font-extrabold uppercase tracking-widest text-rose-600">
                  Dismissed
                </div>
              )}
            </div>

            <div className="p-3 flex-1 flex flex-col">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors capitalize truncate">
                {getSnapshotCategory(snapshot)}
              </h4>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-slate-500">
                <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">
                  {formatCompactDateTime(snapshot.detectedAtUtc)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-semibold text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{getSnapshotLocation(snapshot)}</span>
              </div>
              {reasonLabels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {reasonLabels.slice(0, 2).map((label) => (
                    <span key={label} className="rounded bg-brand/5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-brand">
                      {label}
                    </span>
                  ))}
                </div>
              )}
              {variant === "dismissed" && snapshot.dismissedAt && (
                <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                  <Trash2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatShortDate(snapshot.dismissedAt)}</span>
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
