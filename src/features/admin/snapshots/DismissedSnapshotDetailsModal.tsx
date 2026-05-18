import { Camera, Clock, MapPin, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { getImageUrl } from "@/lib/utils"
import { formatDateTime } from "@/lib/formatters"
import {
  getConfidenceBadgeClass,
  getSnapshotCategory,
  getSnapshotConfidence,
  getSnapshotLocation,
  getSnapshotReasonLabels,
} from "./snapshotUtils"
import type { AISnapshot } from "./types"

type DismissedSnapshotDetailsModalProps = {
  snapshot: AISnapshot | null
  restoringId: string | null
  onClose: () => void
  onRestoreClick: (snapshot: AISnapshot) => void
}

export function DismissedSnapshotDetailsModal({
  snapshot,
  restoringId,
  onClose,
  onRestoreClick,
}: DismissedSnapshotDetailsModalProps) {
  if (!snapshot) return null

  const confidence = getSnapshotConfidence(snapshot)
  const reasonLabels = getSnapshotReasonLabels(snapshot)

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-3xl flex flex-col max-h-[90vh]">
      <ModalHeader
        title="Dismissed Snapshot"
        icon={<Camera className="w-5 h-5 text-white" />}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative min-h-75 shadow-inner">
          {snapshot.snapshotPath ? (
            <img
              src={getImageUrl(snapshot.snapshotPath)}
              alt="Snapshot"
              className="w-full h-auto max-h-125 object-contain"
            />
          ) : (
            <div className="text-slate-600 flex flex-col items-center">
              <Camera className="w-12 h-12 mb-3 opacity-50" />
              <span className="text-sm font-bold uppercase tracking-widest">Image Unavailable</span>
            </div>
          )}

          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg shadow-sm text-xs font-extrabold uppercase tracking-widest border ${getConfidenceBadgeClass(confidence)}`}>
            {confidence}% Match
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Detected Object</p>
            <p className="text-lg font-bold text-slate-900 capitalize">{getSnapshotCategory(snapshot)}</p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Time Detected</p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Clock className="w-4 h-4 text-brand" />
              {formatDateTime(snapshot.detectedAtUtc)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Location / Camera</p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-brand" />
              {getSnapshotLocation(snapshot)}
            </div>
          </div>
        </div>

        {reasonLabels.length > 0 && (
          <div className="rounded-2xl border border-brand/10 bg-brand/5 p-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand">
              <Sparkles className="h-4 w-4" />
              Original AI reason
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {reasonLabels.map((label) => (
                <span key={label} className="rounded-full border border-brand/10 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {snapshot.dismissedAt && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">
            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800">Dismissed as False Alarm</p>
              <p className="text-[11px] font-semibold text-rose-600 mt-0.5">
                {formatDateTime(snapshot.dismissedAt)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <Button
          type="button"
          onClick={onClose}
          className="flex-1 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl uppercase tracking-widest text-xs shadow-sm transition-all"
        >
          Close
        </Button>
        <Button
          type="button"
          onClick={() => onRestoreClick(snapshot)}
          disabled={restoringId === snapshot.id}
          className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl uppercase tracking-widest text-xs shadow-sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restore to Gallery
        </Button>
      </div>
    </Modal>
  )
}
