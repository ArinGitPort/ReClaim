import { cn } from "@/lib/utils"

export function StatusBadge({ status, weight }: { status?: string; weight?: number }) {
  if (weight !== undefined) {
    const styles = weight >= 80 ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                   weight >= 50 ? "bg-amber-100 text-amber-800 border-amber-200" :
                   "bg-rose-100 text-rose-800 border-rose-200"
    return (
      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border", styles)}>
        {weight}% MATCH
      </span>
    )
  }

  if (!status) return null

  const label = status === "CLAIM_PENDING" ? "CLAIM PENDING" : status.replaceAll("_", " ")

  const getStyles = () => {
    switch(status) {
      case 'AVAILABLE': 
      case 'Ready for Pickup':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'ACTIVE_SEARCH': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm'
      case 'CLAIM_PENDING': 
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'MATCHED': 
        return 'bg-indigo-50 text-indigo-700 border-indigo-100'
      case 'SUBMITTED': 
        return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'RETURNED': 
      case 'Closed - Picked Up':
      case 'Closed - Rejected':
        return 'bg-slate-50 text-slate-500 border-slate-100'
      case 'RESOLVED':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'ARCHIVED': 
      case 'REJECTED':
      case 'Inquiry Required':
        return 'bg-rose-50 text-rose-700 border-rose-100'
      case 'PENDING_REVIEW':
      case 'UNDER_REVIEW':
      case 'Pending Verification':
        return 'bg-amber-50 text-amber-700 border-amber-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-100'
    }
  }

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm inline-flex items-center gap-2 transition-all",
      getStyles()
    )}>
      {status === 'CLAIM_PENDING' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {label}
    </span>
  )
}
