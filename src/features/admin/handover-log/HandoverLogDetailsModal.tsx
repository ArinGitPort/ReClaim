import { ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { formatDateTime } from "@/lib/formatters"
import type { HandoverLogRow } from "./types"

type HandoverLogDetailsModalProps = {
  log: HandoverLogRow | null
  isRestoring: boolean
  onClose: () => void
  onRestoreClick: (id: string) => void
}

export function HandoverLogDetailsModal({ log, isRestoring, onClose, onRestoreClick }: HandoverLogDetailsModalProps) {
  return (
    <Modal
      isOpen={Boolean(log)}
      onClose={onClose}
      className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl p-0"
    >
      {log && (
        <>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900">Handover Record Details</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{log.claim?.claimCode ?? "No claim reference"}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailBlock label="Released At" value={formatDateTime(log.releasedAtUtc)} />
              <DetailBlock label="Claim Code" value={log.claim?.claimCode ?? "N/A"} />
              <DetailBlock label="Pickup Token" value={log.pickupTokenPresented} mono />
              <DetailBlock label="Item Code" value={log.foundItem.code} mono />
              <DetailBlock label="Item Title" value={log.foundItem.title} />
              <DetailBlock label="Category" value={log.foundItem.category} />
              <DetailBlock label="Storage Location" value={log.foundItem.storageLocation ?? "Unassigned"} />
              <DetailBlock label="Item Status" value={log.foundItem.status.replaceAll("_", " ")} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Released To</div>
              <p className="mt-1 text-sm font-black text-slate-800">{log.releasedToUser.name}</p>
              <p className="text-xs font-semibold text-slate-600">Student ID: {log.releasedToUser.studentId ?? "N/A"}</p>
              <p className="text-xs font-semibold text-slate-600">Email: {log.releasedToUser.email}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verification Notes</div>
              <p className="mt-2 text-sm font-semibold text-slate-700">{log.note?.trim() ? log.note : "No verification notes recorded."}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => onRestoreClick(log.id)}
                disabled={isRestoring}
                className="h-10 px-6 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              >
                {isRestoring ? "Restoring..." : "Restore Handover"}
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}

function DetailBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={mono ? "mt-1 text-sm font-bold font-mono text-slate-700" : "mt-1 text-sm font-semibold text-slate-700"}>{value}</div>
    </div>
  )
}
