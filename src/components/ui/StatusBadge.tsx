import { cn } from "@/lib/utils"

export interface BadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  const label =
    status === "CLAIM_PENDING"
      ? "CLAIM PENDING"
      : status === "PASSWORD_RESET_REQUIRED"
        ? "PASSWORD RESET REQUIRED"
        : status === "ACTIVE_SEARCH"
          ? "ACTIVE SEARCH"
          : status === "UNDER_REVIEW"
            ? "UNDER REVIEW"
        : status.replaceAll("_", " ")

  const getStyles = () => {
    switch (status) {
      case "AVAILABLE":
      case "ACTIVE":
      case "Approved":
      case "Completed":
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "CLAIM_PENDING":
      case "Ready for Pickup":
      case "Match Found":
      case "MATCHED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Active Search":
      case "ACTIVE_SEARCH":
      case "ACTIVE SEARCH":
        return "bg-brand/10 text-brand border-brand/20"
      case "RETURNED":
      case "Closed":
      case "RESOLVED":
        return "bg-slate-50 text-slate-500 border-slate-100"
      case "ARCHIVED":
      case "DISABLED":
      case "Denied":
      case "Rejected":
      case "Expired":
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-100"
      case "SUSPENDED":
      case "PASSWORD_RESET_REQUIRED":
        return "bg-amber-50 text-amber-700 border-amber-100"
      case "Cancelled":
        return "bg-slate-50 text-slate-500 border-slate-100"
      case "Pending Verification":
      case "Open":
      case "Under Review":
      case "UNDER_REVIEW":
      case "SUBMITTED":
        return "bg-amber-50 text-amber-700 border-amber-100"
      case "Inquiry Required":
      case "Missing":
        return "bg-orange-50 text-orange-700 border-orange-100"
      default:
        return "bg-slate-50 text-slate-600 border-slate-100"
    }
  }

  const needsPulse = ["CLAIM_PENDING", "Pending Verification"].includes(status)

  return (
    <span
      className={cn(
        "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm inline-flex items-center gap-2",
        getStyles(),
        className
      )}
    >
      {needsPulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      )}
      {label}
    </span>
  )
}
