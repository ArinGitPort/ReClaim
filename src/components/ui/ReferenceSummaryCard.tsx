import { cn } from "@/lib/utils"

type ReferenceSummaryCardProps = {
  referenceLabel?: string
  referenceCode: string
  statusLabel: string
  statusTone?: "brand" | "emerald" | "amber"
}

export function ReferenceSummaryCard({
  referenceLabel = "Reference #",
  referenceCode,
  statusLabel,
  statusTone = "brand",
}: ReferenceSummaryCardProps) {
  const toneClassName = {
    brand: "bg-brand/10 text-brand",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[statusTone]

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{referenceLabel}</span>
        <span className="text-sm font-mono font-black text-slate-700 text-right">{referenceCode}</span>
      </div>
      <div className="flex justify-between items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</span>
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest", toneClassName)}>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          {statusLabel}
        </span>
      </div>
    </div>
  )
}
