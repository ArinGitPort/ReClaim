import { cn } from "@/lib/utils"
import type { ClaimStatus } from "./types"

export function isPendingClaimState(status: ClaimStatus): boolean {
  return status === "PENDING_VERIFICATION" || status === "INQUIRY_REQUIRED"
}

export function ClaimStatusPill({ status }: { status: ClaimStatus }) {
  const styles: Record<ClaimStatus, string> = {
    PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
    INQUIRY_REQUIRED: "bg-orange-50 text-orange-700 border-orange-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DENIED: "bg-rose-50 text-rose-700 border-rose-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-300",
    EXPIRED: "bg-rose-50 text-rose-700 border-rose-200",
  }
  const labels: Record<ClaimStatus, string> = {
    PENDING_VERIFICATION: "Review",
    INQUIRY_REQUIRED: "Waiting for Student",
    APPROVED: "Ready for Pickup",
    DENIED: "Denied",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired Hold",
  }

  return (
    <span className={cn("px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest", styles[status])}>
      {labels[status]}
    </span>
  )
}
