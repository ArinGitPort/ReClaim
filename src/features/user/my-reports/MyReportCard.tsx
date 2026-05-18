import { Calendar, Clock, FileText, MapPin, ShieldCheck, Ticket } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { cn } from "@/lib/utils"
import { isClosableReportStatus, reportStatusMessage } from "./reportStatus"
import type { ReportView } from "./types"

type MyReportCardProps = {
  report: ReportView
  focusCode: string
  closingTicketId: string | null
  onCloseTicket: (report: ReportView) => void
}

export function MyReportCard({ report, focusCode, closingTicketId, onCloseTicket }: MyReportCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all",
        report.id.toUpperCase() === focusCode && "ring-2 ring-brand/40 border-brand bg-brand/3"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
          <FileText className="w-7 h-7 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{report.id}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{report.category}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{report.color}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-lg leading-tight">{report.item}</h3>
          <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {report.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Filed {report.dateFiled}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <StatusBadge status={report.status} />
          <ReportStatusMessage status={report.status} />
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <DetailField label="Date Lost" value={report.dateLost} />
        <DetailField label="Estimated Time Window" value={report.timeWindow} />
        <DetailField label="Brand/Model" value={report.brand} />
        <DetailField label="Distinguishing Marks" value={report.marks} />
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Private Note</div>
          <div className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
            {report.privateNote}
          </div>
        </div>
        {report.rawStatus === "MATCHED" && report.pickupToken && <PickupTokenPanel report={report} />}
        {isClosableReportStatus(report.rawStatus) && (
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="button"
              disabled={closingTicketId === report.ticketId}
              onClick={() => onCloseTicket(report)}
              className="h-10 px-4 rounded-lg border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {closingTicketId === report.ticketId ? "Closing..." : "Close Ticket"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReportStatusMessage({ status }: { status: string }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <Clock className="w-3 h-3" /> {reportStatusMessage(status)}
    </p>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-700">{value}</div>
    </div>
  )
}

function PickupTokenPanel({ report }: { report: ReportView }) {
  return (
    <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="text-sm font-bold text-emerald-800">Claim Approved - Pickup Token Issued</div>
          <div className="text-xs font-semibold text-emerald-600 mt-0.5">Present this token and your ID at the Campus Admin Office.</div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-emerald-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-black text-emerald-800 tracking-wide">
          <Ticket className="w-5 h-5" />
          {report.pickupToken}
        </div>
        {report.pickupTokenExpires && (
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            Expires {new Date(report.pickupTokenExpires).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
