import { Link, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import type { ReportRow } from "@/features/admin/missing-items/types"

type MatchHistoryDetailsModalProps = {
  report: ReportRow | null
  isUpdating: boolean
  onClose: () => void
  onUnlinkClick: (id: string) => void
}

export function MatchHistoryDetailsModal({ report, isUpdating, onClose, onUnlinkClick }: MatchHistoryDetailsModalProps) {
  return (
    <Modal
      isOpen={Boolean(report)}
      onClose={onClose}
      className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl p-0"
    >
      {report && (
        <>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                <Link className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900">Match Details</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{report.code}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailBlock label="Report Date" value={report.date} />
              <DetailBlock label="Report Code" value={report.code} mono />
              <DetailBlock label="Reported Item" value={report.item} />
              <DetailBlock label="Category" value={report.category} />
              <DetailBlock label="Color" value={report.color || "N/A"} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reporter Info</div>
              <p className="mt-1 text-sm font-black text-slate-800">{report.student}</p>
              <p className="text-xs font-semibold text-slate-600">Student ID: {report.studentId ?? "N/A"}</p>
            </div>

            {report.linkedItem ? (
              <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/30 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">Linked Inventory Item</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailBlock label="Item Code" value={report.linkedItem.code} mono />
                  <DetailBlock label="Item Title" value={report.linkedItem.title} />
                  <DetailBlock label="Category" value={report.linkedItem.category} />
                  <DetailBlock label="Status" value={report.linkedItem.status.replaceAll("_", " ")} />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Linked Inventory Item</div>
                <p className="mt-2 text-sm font-semibold text-slate-700 italic">No item is currently linked to this report.</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => onUnlinkClick(report.id)}
                disabled={isUpdating || !report.linkedItem}
                className="h-10 px-6 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              >
                {isUpdating ? "Unlinking..." : "Unlink Match"}
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
