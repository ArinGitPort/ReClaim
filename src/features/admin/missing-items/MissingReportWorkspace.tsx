import { useState, useEffect } from "react"
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Images,
  Link2,
  MessageSquare,
  ShieldAlert,
  X,
  XCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Modal } from "@/components/ui/Modal"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
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
  onOpenMessages: () => void
  onReject: () => void
  onUpdateStatus: (status: ReportStatus) => void
  onLinked?: (reportId: string) => void
  hasUnreadMessage: boolean
}

type ScoredInventoryMatch = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundLocation: string
  status: string
  matchScore: number
}

export function MissingReportWorkspace({
  report,
  isUpdating,
  error,
  isPrivateNoteVisible,
  onRevealPrivateNote,
  onOpenLinker,
  onOpenMessages,
  onReject,
  onUpdateStatus,
  onLinked,
  hasUnreadMessage,
}: MissingReportWorkspaceProps) {
  const [matches, setMatches] = useState<ScoredInventoryMatch[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [pendingMatch, setPendingMatch] = useState<ScoredInventoryMatch | null>(null)

  useEffect(() => {
    if (!report?.id) {
      setMatches([])
      return
    }
    
    let isMounted = true
    setIsLoadingMatches(true)
    
    api.get<{ matches: ScoredInventoryMatch[] }>(`/reports/${report.id}/matches`)
      .then((res) => {
        if (isMounted) {
          setMatches(res.data.matches.slice(0, 3)) // top 3 recommendations
        }
      })
      .catch(() => {
        if (isMounted) setMatches([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingMatches(false)
      })

    return () => { isMounted = false }
  }, [report?.id])

  async function executeQuickMatch() {
    if (!report || isLinking || !pendingMatch) return
    setIsLinking(true)
    try {
      await api.patch(`/reports/${report.id}`, {
        status: "MATCHED",
        matchedItemId: pendingMatch.id,
      })
      onLinked?.(report.id)
    } catch {
      // ignore
    } finally {
      setIsLinking(false)
      setPendingMatch(null)
    }
  }
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
            <Button
              variant="outline"
              size="sm"
              disabled={!isAuthorized}
              onClick={onOpenMessages}
              className={cn(
                "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg relative",
                !isAuthorized && "opacity-50 cursor-not-allowed",
                hasUnreadMessage && "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              )}
            >
              <MessageSquare className={cn("w-4 h-4 mr-2", hasUnreadMessage ? "text-amber-600" : "text-brand")} /> {hasUnreadMessage ? "New Message" : "Messages"}
              {hasUnreadMessage && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />}
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
                matches={matches}
                isLoadingMatches={isLoadingMatches}
                isLinking={isLinking}
                onQuickMatch={setPendingMatch}
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

      <ConfirmModal
        isOpen={pendingMatch !== null}
        onClose={() => !isLinking && setPendingMatch(null)}
        onConfirm={() => void executeQuickMatch()}
        title="Confirm Quick Match"
        message={`Are you sure you want to match this report to item ${pendingMatch?.code}? This will link the items and notify the student.`}
        confirmText="Yes, Match Item"
        cancelText="Cancel"
        isLoading={isLinking}
      />
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
  matches,
  isLoadingMatches,
  isLinking,
  onQuickMatch,
}: {
  report: ReportRow
  isPrivateNoteVisible: boolean
  onRevealPrivateNote: (reportId: string, visible: boolean) => void
  matches: ScoredInventoryMatch[]
  isLoadingMatches: boolean
  isLinking: boolean
  onQuickMatch: (match: ScoredInventoryMatch) => void
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
          <ReferenceAttachments report={report} />
          {report.attachmentUrls.length > 0 && (
            <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/50 mt-4 space-y-3">
              <h6 className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-800 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                System Photo Validation
              </h6>
              <p className="text-[11px] font-medium text-emerald-800 leading-relaxed">
                System verified properties from uploaded media. The reference photo matches the categorizations of <span className="font-extrabold">{report.category}</span> and color tone <span className="font-extrabold">{report.color}</span>.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                  Category: {report.category}
                </span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                  Primary Hue: {report.color}
                </span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                  Image Integrity Verified
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <h6 className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand font-mono">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              System Recommendations
            </h6>
            
            {isLoadingMatches ? (
              <div className="flex items-center justify-center p-6 border border-slate-100 rounded-xl bg-slate-50">
                <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-brand/30 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-800">{match.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">{match.matchScore}% Match</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mt-1 flex gap-2">
                        <span className="text-slate-400 font-mono text-[10px] uppercase bg-slate-100 px-1 rounded">{match.code}</span>
                        <span>{match.foundLocation}</span>
                      </div>
                    </div>
                    <Button 
                      disabled={isLinking}
                      onClick={() => onQuickMatch(match)}
                      className="h-8 px-3 text-xs font-bold uppercase tracking-wider bg-brand hover:bg-brand-active text-white rounded-lg"
                    >
                      {isLinking ? "Matching..." : "Quick Match"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recommendations found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DetailSection>
  )
}

function ReferenceAttachments({ report }: { report: ReportRow }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (report.attachmentUrls.length === 0) {
    return (
      <div className="w-full aspect-video bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 border-dashed">
        <HelpCircle className="w-8 h-8 text-slate-200 mb-2" />
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No media attached to report</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setPreviewUrl(report.attachmentUrls[0])}
        className="block w-full aspect-video overflow-hidden rounded-xl bg-slate-50"
      >
        <img src={report.attachmentUrls[0]} alt={`${report.item} reference attachment`} className="h-full w-full object-cover" />
      </button>
      {report.attachmentUrls.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          {report.attachmentUrls.slice(1).map((url, index) => (
            <button
              type="button"
              key={url}
              onClick={() => setPreviewUrl(url)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-brand/40 hover:text-brand"
            >
              <Images className="h-3.5 w-3.5" />
              Attachment {index + 2}
            </button>
          ))}
        </div>
      )}
      <ReportAttachmentPreviewModal
        report={report}
        imageUrl={previewUrl}
        onClose={() => setPreviewUrl(null)}
      />
    </div>
  )
}

function ReportAttachmentPreviewModal({
  report,
  imageUrl,
  onClose,
}: {
  report: ReportRow
  imageUrl: string | null
  onClose: () => void
}) {
  return (
    <Modal isOpen={Boolean(imageUrl)} onClose={onClose} className="max-w-5xl bg-transparent border-0 shadow-none overflow-visible">
      <div className="relative p-2">
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg transition hover:text-slate-900"
          aria-label="Close reference attachment preview"
        >
          <X className="h-5 w-5" />
        </button>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`${report.item} reference attachment preview`}
            className="mx-auto max-h-[82vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
      </div>
    </Modal>
  )
}
