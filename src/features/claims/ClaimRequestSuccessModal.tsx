import { ArrowRight, MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ReferenceSummaryCard } from "@/components/ui/ReferenceSummaryCard"
import { StatusModal } from "@/components/ui/StatusModal"

type ClaimRequestSuccessModalProps = {
  isOpen: boolean
  onClose: () => void
  claimCode: string | null
}

export function ClaimRequestSuccessModal({ isOpen, onClose, claimCode }: ClaimRequestSuccessModalProps) {
  if (!isOpen) return null

  const referenceCode = claimCode ?? "Pending"

  return (
    <StatusModal
      isOpen={isOpen}
      onClose={onClose}
      title="Claim Submitted"
      message="Your claim request has been reserved and sent to the Campus Admin Office for verification."
      bottomText={
        <>
          <MessageSquare className="w-3.5 h-3.5 opacity-50" />
          Check My Claims for messages and updates
        </>
      }
      actions={
        <div className="space-y-3">
          <Button asChild className="w-full h-12 font-black bg-brand hover:bg-brand/90 transition-all active:scale-95 shadow-sm" onClick={onClose}>
            <Link to={claimCode ? `/my-claims?focus=${claimCode}` : "/my-claims"}>
              VIEW MY CLAIMS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" className="w-full h-12 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl uppercase tracking-widest text-[11px]" onClick={onClose}>
            Back to Gallery
          </Button>
        </div>
      }
    >
      <ReferenceSummaryCard referenceCode={referenceCode} statusLabel="Pending Review" statusTone="amber" />
    </StatusModal>
  )
}
