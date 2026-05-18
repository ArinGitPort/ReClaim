import { Camera, Clock, MapPin, Trash2 } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { formatShortDate } from "@/lib/formatters"
import {
  getConfidenceBadgeClass,
  getSnapshotCategory,
  getSnapshotConfidence,
  getSnapshotLocation,
} from "./snapshotUtils"
import type { AISnapshot } from "./types"

type SnapshotGridProps = {
  snapshots: AISnapshot[]
  variant?: "active" | "dismissed"
  onSelect: (snapshot: AISnapshot) => void
}

export function SnapshotGrid({ snapshots, variant = "active", onSelect }: SnapshotGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {snapshots.map((snapshot) => {
        const confidence = getSnapshotConfidence(snapshot)

        return (
          <button
            key={snapshot.id}
            type="button"
            onClick={() => onSelect(snapshot)}
            className={`text-left bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col ${
              variant === "dismissed" ? "opacity-80 hover:opacity-100" : ""
            }`}
          >
            <div className="w-full h-32 bg-slate-100 border-b border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group-hover:opacity-90 transition-opacity">
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
                  {new Date(snapshot.detectedAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-semibold text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{getSnapshotLocation(snapshot)}</span>
              </div>
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
