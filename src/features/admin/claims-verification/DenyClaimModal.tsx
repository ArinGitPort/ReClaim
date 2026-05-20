import { AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import type { ClaimRow } from "./types"

type DenyClaimModalProps = {
  isOpen: boolean
  claim: ClaimRow | null
  reviewerNote: string
  isLoading: boolean
  onReviewerNoteChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export function DenyClaimModal({
  isOpen,
  claim,
  reviewerNote,
  isLoading,
  onReviewerNoteChange,
  onClose,
  onConfirm,
}: DenyClaimModalProps) {
  if (!isOpen || !claim) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
      <ModalHeader
        title="Deny Claim"
        subtitle={`Student-facing message for ${claim.claimCode}`}
        icon={<AlertCircle className="h-5 w-5 text-white" />}
        iconWrapperClassName="bg-rose-600"
        titleClassName="text-rose-700"
        onClose={onClose}
      />

      <div className="space-y-5 p-6">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-900">
                {claim.foundItem.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                {claim.claimantUser.name} &bull; {claim.foundItem.code} &bull; {claim.foundItem.foundLocation}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">
            Reviewer Note / Student Message
          </label>
          <textarea
            value={reviewerNote}
            onChange={(event) => onReviewerNoteChange(event.target.value)}
            rows={5}
            placeholder="Explain why this claim could not be verified."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-rose-200 focus:bg-white focus:ring-2 focus:ring-rose-500/20"
          />
          <p className="text-xs font-semibold text-slate-500">
            This message is saved on the claim and shown to the student in My Claims.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-6 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="h-12 flex-1 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-white"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="h-12 flex-1 rounded-xl bg-rose-600 text-xs font-black uppercase tracking-widest text-white shadow-sm hover:bg-rose-700"
        >
          {isLoading ? "Denying..." : "Yes, Deny Claim"}
        </Button>
      </div>
    </Modal>
  )
}
