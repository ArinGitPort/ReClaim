import { CheckCircle2, Clock3, MessageSquare, ShieldAlert, User, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClaimMessages } from "@/components/ui/ClaimMessagesModal"
import { cn } from "@/lib/utils"
import { ClaimStatusPill, isPendingClaimState } from "./claimStatus"
import { InfoRow, ProofField } from "./ClaimDetailPrimitives"
import { proofEntries } from "./proofUtils"
import type { ClaimDecision, ClaimRow } from "./types"

type ClaimWorkspaceProps = {
  claim: ClaimRow | null
  isLoading: boolean
  isSubmitting: boolean
  note: string
  onNoteChange: (value: string) => void
  onRequestDecision: (decision: ClaimDecision) => void
}

export function ClaimWorkspace({
  claim,
  isLoading,
  isSubmitting,
  note,
  onNoteChange,
  onRequestDecision,
}: ClaimWorkspaceProps) {
  return (
    <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-175">
      {!claim && !isLoading && (
        <div className="p-10 text-center text-sm font-semibold text-slate-500">Select a claim to review.</div>
      )}

      {claim && (
        <>
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase underline underline-offset-4 decoration-brand/20 decoration-2">Claim Workspace</h2>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Reference:</span>
                <span className="text-brand font-extrabold tracking-tight">{claim.claimCode}</span>
              </div>
            </div>
            <ClaimStatusPill status={claim.status} />
          </div>

          <div className="p-8 lg:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <ClaimantProfile claim={claim} />
              <ClaimedItem claim={claim} />
            </div>

            <div className="space-y-4">
              <SubmittedProof claim={claim} />
              <ClaimDialogue claim={claim} />
            </div>

            <div className="space-y-2 pt-6 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Reviewer Note (Required for Denial)</label>
              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Provide a reason if you are denying this claim..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-200 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !isPendingClaimState(claim.status)}
                onClick={() => onRequestDecision("DENIED")}
                className="h-10 border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                <XCircle className="w-4 h-4 mr-2" /> Deny
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || !isPendingClaimState(claim.status)}
                onClick={() => onRequestDecision("APPROVED")}
                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ClaimantProfile({ claim }: { claim: ClaimRow }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <User className="w-3.5 h-3.5" /> Claimant Profile
      </h3>
      <div className="space-y-5">
        <InfoRow label="Name" value={claim.claimantUser.name} />
        <InfoRow label="Student ID" value={claim.claimantUser.studentId ?? "N/A"} />
        <InfoRow label="Email" value={claim.claimantUser.email} />
      </div>
    </div>
  )
}

function ClaimedItem({ claim }: { claim: ClaimRow }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5" /> Claimed Item
      </h3>
      <div className="space-y-5">
        <InfoRow label="Inventory Code" value={claim.foundItem.code} />
        <InfoRow label="Title" value={claim.foundItem.title} />
        <InfoRow label="Category" value={claim.foundItem.category} />
        <InfoRow label="Color" value={claim.foundItem.color} />
        <InfoRow label="Found Location" value={claim.foundItem.foundLocation} />
      </div>
    </div>
  )
}

function SubmittedProof({ claim }: { claim: ClaimRow }) {
  return (
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Submitted Proof Details</h3>
      <div className="rounded-xl border border-brand/10 bg-brand/5 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {proofEntries(claim.submittedProof).map((entry) => (
            <ProofField key={entry.label} label={entry.label} value={entry.value} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ClaimDialogue({ claim }: { claim: ClaimRow }) {
  return (
    <div className="pt-6">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
        <MessageSquare className="w-3.5 h-3.5" /> Dialogue & Chat History
      </h3>
      <div className="h-[400px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
        {isPendingClaimState(claim.status) ? (
          <div className="absolute inset-x-0 top-0 h-10 bg-amber-50 border-b border-amber-100 flex items-center px-4 z-10">
            <span className="text-xs font-bold text-amber-700 flex items-center gap-2">
              <Clock3 className="w-3.5 h-3.5" /> Ask questions or request more proof from the student here. The claim stays pending until you approve or deny it.
            </span>
          </div>
        ) : null}
        <div className={cn("h-full", isPendingClaimState(claim.status) ? "pt-10" : "")}>
          <ClaimMessages claimId={claim.id} isReadOnly={!isPendingClaimState(claim.status)} />
        </div>
      </div>
    </div>
  )
}
