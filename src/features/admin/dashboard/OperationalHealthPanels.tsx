import { Archive, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { NeedsAttentionPanel } from "./NeedsAttentionPanel"
import type { DashboardData } from "./types"
import type { OperationsData } from "./types"

export function OperationalHealthPanels({ data, operations }: { data: DashboardData; operations: OperationsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InventoryHealthPanel data={data} />
      <NeedsAttentionPanel operations={operations} />
    </div>
  )
}

function InventoryHealthPanel({ data }: { data: DashboardData }) {
  const total = data.inventoryBreakdown.available + data.inventoryBreakdown.claimPending + data.inventoryBreakdown.returned + data.inventoryBreakdown.archived

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[340px]">
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <div className="w-7 h-7 bg-brand/5 border border-brand/10 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-brand" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Inventory Health</h3>
      </div>
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {([
          { label: "Available", count: data.inventoryBreakdown.available, color: "bg-brand", textColor: "text-brand" },
          { label: "Claim Pending", count: data.inventoryBreakdown.claimPending, color: "bg-amber-500", textColor: "text-amber-600" },
          { label: "Returned", count: data.inventoryBreakdown.returned, color: "bg-emerald-500", textColor: "text-emerald-600" },
          { label: "Archived", count: data.inventoryBreakdown.archived, color: "bg-slate-400", textColor: "text-slate-500" },
        ] as const).map(({ label, count, color, textColor }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", color)} />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-extrabold", textColor)}>{count}</span>
                  <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className={cn("h-2 rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Items</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800">{total}</span>
        </div>
      </div>
    </div>
  )
}
