import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardData } from "./types"

export function LostReportsOverview({ data }: { data: DashboardData }) {
  const total = Object.values(data.lostReportBreakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center">
          <Search className="w-4 h-4 text-rose-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Lost Reports Overview</h3>
        <span className="ml-auto text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total: {total}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {([
          { label: "Submitted", key: "submitted", color: "bg-slate-400", text: "text-slate-600", ring: "ring-slate-200", bg: "bg-slate-50" },
          { label: "Under Review", key: "underReview", color: "bg-blue-400", text: "text-blue-600", ring: "ring-blue-100", bg: "bg-blue-50" },
          { label: "Active Search", key: "activeSearch", color: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-100", bg: "bg-amber-50" },
          { label: "Matched", key: "matched", color: "bg-brand", text: "text-brand", ring: "ring-brand/20", bg: "bg-brand/5" },
          { label: "Resolved", key: "resolved", color: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-100", bg: "bg-emerald-50" },
          { label: "Rejected", key: "rejected", color: "bg-rose-500", text: "text-rose-600", ring: "ring-rose-100", bg: "bg-rose-50" },
        ] as const).map(({ label, key, color, text, ring, bg }) => {
          const count = data.lostReportBreakdown[key]
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={key} className={cn("rounded-xl p-4 border flex flex-col gap-3", bg, `ring-1 ${ring} border-transparent`)}>
              <div className="flex items-center justify-between">
                <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
                <span className="text-[10px] font-extrabold text-slate-400">{pct}%</span>
              </div>
              <div>
                <p className={cn("text-2xl font-extrabold tracking-tight", text)}>{count}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/60">
                <div className={cn("h-1.5 rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
