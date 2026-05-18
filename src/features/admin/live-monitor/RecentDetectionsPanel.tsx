import { Activity, Clock, MapPin, ScanSearch } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getConfidenceBadgeClass, getSnapshotCategory, getSnapshotConfidence, getSnapshotLocation } from "@/features/admin/snapshots/snapshotUtils"
import type { RecentSnapshot } from "./types"

type RecentDetectionsPanelProps = {
  snapshots: RecentSnapshot[]
}

export function RecentDetectionsPanel({ snapshots }: RecentDetectionsPanelProps) {
  return (
    <div className="w-full lg:w-80 flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-shrink-0 max-h-[300px] lg:max-h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand" />
          Recent Detections
        </h3>
        <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-[10px] font-bold">
          {snapshots.length > 0 ? "LIVE" : "-"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {snapshots.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <ScanSearch className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent detections</p>
            <p className="text-[11px] text-slate-400 mt-1">AI snapshots will appear here in real-time.</p>
          </div>
        ) : (
          snapshots.map((snapshot) => {
            const confidence = getSnapshotConfidence(snapshot)

            return (
              <Link
                key={snapshot.id}
                to="/admin/snapshots"
                className="block bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-brand/30 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(snapshot.detectedAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold border ${getConfidenceBadgeClass(confidence)}`}>
                    {confidence}%
                  </span>
                </div>
                <div className="font-bold text-slate-700 text-sm group-hover:text-brand transition-colors capitalize">
                  {getSnapshotCategory(snapshot)} Detected
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {getSnapshotLocation(snapshot)}
                </div>
              </Link>
            )
          })
        )}
      </div>
      <div className="p-3 bg-white border-t border-slate-200">
        <Link to="/admin/snapshots">
          <Button className="w-full h-9 bg-brand hover:bg-brand-active text-white font-bold text-xs uppercase tracking-widest shadow-sm">
            View All Snapshots
          </Button>
        </Link>
      </div>
    </div>
  )
}
