import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Link2,
  MessageSquare,
  ShieldAlert,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DetailItem, DetailSection } from "./ReportDetailPrimitives"
import { isAuthorizedReport, isReviewableReport, reportNextAction } from "./reportStatus"
import type { ReportRow, ReportStatus } from "./types"

type MissingReportWorkspaceProps = {
  report: ReportRow | undefined
  isUpdating: boolean
  error: string | null
  isPrivateNoteVisible: boolean
  onRevealPrivateNote: (reportId: string, visible: boolean) => void
  onOpenLinker: () => void
  onReject: () => void
  onUpdateStatus: (status: ReportStatus) => void
}

export function MissingReportWorkspace({
  report,
  isUpdating,
  error,
  isPrivateNoteVisible,
  onRevealPrivateNote,
  onOpenLinker,
  onReject,
  onUpdateStatus,
}: MissingReportWorkspaceProps) {
  if (!report) {
    return (
      <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-175 flex flex-col relative">
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-pulse">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-6">
            <FileText className="w-12 h-12 text-slate-200" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Accessing Queue...</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Select a report from the list to begin system verification.</p>
          </div>
        </div>
      </div>
    )
  }

  const isAuthorized = isAuthorizedReport(report.status)
  const canReviewReport = isReviewableReport(report.status)

  return (
    <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-175 flex flex-col relative">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase underline underline-offset-4 decoration-brand/20 decoration-2">Report Workspace</h2>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Reference:</span>
                <span className="text-brand font-extrabold tracking-tight">{report.code}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand">
              {reportNextAction(report.status)}
            </span>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg">
              <MessageSquare className="w-4 h-4 mr-2 text-brand" /> Send Inquiry
            </Button>
            <Button
              disabled={!isAuthorized}
              onClick={onOpenLinker}
              size="sm"
              className={cn(
                "text-white font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-lg transition-all active:scale-95",
                isAuthorized
                  ? "bg-brand hover:bg-brand-active shadow-lg shadow-brand/20 ring-2 ring-brand/20"
                  : "bg-slate-300 cursor-not-allowed"
              )}
            >
              <Link2 className="w-4 h-4 mr-2" /> Match Inventory
            </Button>
          </div>
        </div>
        {isAuthorized && (
          <div className="px-6 pb-5 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
            Report authorized. Next required step: match this report with found inventory.
          </div>
        )}

        <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <ReportedIdentity report={report} />
              <ConditionalProofData report={report} />
              {report.status === "MATCHED" && report.linkedItem && <LinkedAsset report={report} />}
            </div>

            <div className="space-y-10">
              <PrivacyGuardedData
                report={report}
                isPrivateNoteVisible={isPrivateNoteVisible}
                onRevealPrivateNote={onRevealPrivateNote}
              />
              {canReviewReport ? (
                <div className="pt-8 border-t border-slate-100 flex gap-4">
                  <Button
                    disabled={isUpdating}
                    onClick={onReject}
                    variant="outline"
                    className="flex-1 h-12 bg-white border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject Report
                  </Button>
                  <Button
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus("ACTIVE_SEARCH")}
                    className="flex-2 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Verify & Authorize
                  </Button>
                </div>
              ) : (
                <div className="pt-8 border-t border-slate-100 rounded-xl bg-slate-50 px-5 py-4 text-xs font-semibold text-slate-600">
                  Review decision is already recorded for this report. Continue with inventory matching or follow-up handling.
                </div>
              )}
              {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportedIdentity({ report }: { report: ReportRow }) {
  return (
    <DetailSection title="Reported Identity">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Student Name" value={report.student} />
          <DetailItem label="Student Number" value={report.studentId} />
        </div>
        <div className="h-px bg-slate-100 w-full" />
        <DetailItem label="Item Name / Description" value={report.item} />
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Category" value={report.category} />
          <DetailItem label="Primary Color" value={report.color} />
        </div>
        <DetailItem label="Brand / Model" value={report.brand} />
        <div className="h-px bg-slate-100 w-full" />
        <DetailItem label="Last Known Location" value={report.location} />
        <DetailItem label="Estimated Time Window" value={report.timeWindow} />
        <DetailItem label="Date of Loss" value={report.date} />
      </div>
    </DetailSection>
  )
}

function ConditionalProofData({ report }: { report: ReportRow }) {
  return (
    <div className="p-6 bg-brand/5 rounded-xl border border-brand/10 space-y-3">
      <h5 className="flex items-center gap-2 text-[10px] font-bold text-brand/60 uppercase tracking-widest font-mono px-3 py-1 bg-brand/5 rounded-lg w-fit">
        <CheckCircle2 className="w-3 h-3" />
        Conditional Proof Data
      </h5>
      <div className="grid grid-cols-1 gap-4">
        {report.category === "Electronics" && report.deviceName && (
          <ProofDatum label="Device / Bluetooth Name" value={report.deviceName} />
        )}
        {report.category === "Wallets/IDs" && report.nameOnDoc && (
          <ProofDatum label="Name on Document" value={report.nameOnDoc} />
        )}
        <ProofDatum label="Marks / Stickers" value={report.marks} />
      </div>
    </div>
  )
}

function ProofDatum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</div>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  )
}

function LinkedAsset({ report }: { report: ReportRow }) {
  if (!report.linkedItem) return null

  return (
    <div className="p-6 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-3">
      <h5 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Linked Asset</h5>
      <div className="space-y-2">
        <DetailItem label="Inventory Code" value={report.linkedItem.code} />
        <DetailItem label="Matched Item" value={report.linkedItem.title} />
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Category" value={report.linkedItem.category} />
          <DetailItem label="Color" value={report.linkedItem.color} />
        </div>
        <DetailItem label="Storage Location" value={report.linkedItem.storageLocation} />
      </div>
    </div>
  )
}

function PrivacyGuardedData({
  report,
  isPrivateNoteVisible,
  onRevealPrivateNote,
}: {
  report: ReportRow
  isPrivateNoteVisible: boolean
  onRevealPrivateNote: (reportId: string, visible: boolean) => void
}) {
  return (
    <DetailSection title="Privacy Guarded Data" icon={<ShieldAlert className="w-4 h-4 text-rose-500" />}>
      <div className="space-y-4">
        <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed relative group transition-all hover:bg-white hover:border-brand/20">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-mono">Student Private Note</label>
          <div className={cn(
            "text-sm transition-all duration-300",
            isPrivateNoteVisible
              ? "text-slate-700"
              : "blur-md select-none text-slate-300 pointer-events-none group-hover:blur-sm"
          )}
          >
            {report.privateNote}
          </div>
          <div className={cn(
            "absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all",
            isPrivateNoteVisible
              ? "bg-transparent pointer-events-none opacity-0"
              : "bg-white/40 backdrop-blur-[2px] opacity-100 group-hover:bg-white/10"
          )}
          >
            <Button
              size="sm"
              onClick={() => onRevealPrivateNote(report.id, true)}
              className="bg-brand text-white hover:bg-brand-active text-[10px] font-bold tracking-widest h-9 px-6 rounded-lg uppercase shadow-sm pointer-events-auto"
            >
              <Eye className="w-3.5 h-3.5 mr-2" /> Reveal Private Note
            </Button>
          </div>
          {isPrivateNoteVisible && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRevealPrivateNote(report.id, false)}
                className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-600"
              >
                <EyeOff className="w-3.5 h-3.5 mr-2" /> Hide Private Note
              </Button>
            </div>
          )}
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-inner">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Reference Attachment</label>
          <div className="w-full aspect-video bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 border-dashed">
            <HelpCircle className="w-8 h-8 text-slate-200 mb-2" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No media attached to report</span>
          </div>
        </div>
      </div>
    </DetailSection>
  )
}
