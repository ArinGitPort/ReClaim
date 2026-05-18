import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function MetricCard({
  icon,
  label,
  value,
  trend,
  color,
  alert = false,
}: {
  icon: ReactNode
  label: string
  value: string
  trend: string
  color: string
  alert?: boolean
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:border-slate-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm",
          color === "brand" ? "bg-brand/5 border border-brand/10" :
            color === "amber" ? "bg-amber-50 border border-amber-100" :
              color === "emerald" ? "bg-emerald-50 border border-emerald-100" :
                "bg-blue-50 border border-blue-100"
        )}
        >
          {icon}
        </div>
        {alert && <div className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/10 animate-pulse" />}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        <p className={`text-[9px] font-extrabold tracking-widest uppercase mt-2 ${alert ? "text-amber-600" : "text-slate-400"}`}>{trend}</p>
      </div>
    </div>
  )
}
