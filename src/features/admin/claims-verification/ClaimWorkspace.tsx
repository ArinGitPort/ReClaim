import type { ReactNode } from "react"
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
  hasUnreadMessage: boolean
  onMessagesViewed: () => void
  onRequestDecision: (decision: ClaimDecision) => void
}

export function ClaimWorkspace({
  claim,
  isLoading,
  isSubmitting,
  hasUnreadMessage,
  onMessagesViewed,
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
              <ClaimDialogue claim={claim} hasUnreadMessage={hasUnreadMessage} onMessagesViewed={onMessagesViewed} />
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-6 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !isPendingClaimState(claim.status)}
                onClick={() => onRequestDecision("DENIED")}
                className="h-12 px-8 bg-white border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all"
              >
                <XCircle className="w-4 h-4 mr-2" /> Deny Claim
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || !isPendingClaimState(claim.status)}
                onClick={() => onRequestDecision("APPROVED")}
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Claim
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
      <WorkspaceSectionLabel title="Claimant Profile" icon={<User className="w-3.5 h-3.5" />} />
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
      <WorkspaceSectionLabel title="Claimed Item" icon={<ShieldAlert className="w-3.5 h-3.5" />} />
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
      <div className="mb-3">
        <WorkspaceSectionLabel title="Submitted Proof Details" icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
      </div>
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

function ClaimDialogue({
  claim,
  hasUnreadMessage,
  onMessagesViewed,
}: {
  claim: ClaimRow
  hasUnreadMessage: boolean
  onMessagesViewed: () => void
}) {
  return (
    <div className="pt-6">
      <div className="flex items-center gap-2 mb-3">
        <WorkspaceSectionLabel title="Messages & Chat History" icon={<MessageSquare className="w-3.5 h-3.5" />} />
        {hasUnreadMessage && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            New student message
          </span>
        )}
      </div>
      <div className="h-[400px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
        {isPendingClaimState(claim.status) ? (
          <div className="absolute inset-x-0 top-0 h-10 bg-amber-50 border-b border-amber-100 flex items-center px-4 z-10">
            <span className="text-xs font-bold text-amber-700 flex items-center gap-2">
              <Clock3 className="w-3.5 h-3.5" /> Ask questions or request more proof from the student here. The claim stays pending until you approve or deny it.
            </span>
          </div>
        ) : null}
        <div className={cn("h-full", isPendingClaimState(claim.status) ? "pt-10" : "")}>
          <ClaimMessages claimId={claim.id} onViewed={onMessagesViewed} isReadOnly={!isPendingClaimState(claim.status)} />
        </div>
      </div>
    </div>
  )
}

function WorkspaceSectionLabel({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 bg-brand/5 -mx-3 px-3 py-1 rounded-lg w-fit">
      <span className="text-brand/70">{icon}</span>
      <h3 className="text-[11px] font-extrabold text-brand uppercase tracking-[0.2em]">{title}</h3>
    </div>
  )
}
