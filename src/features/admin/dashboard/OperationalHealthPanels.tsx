import { Archive, BarChart3, FileCheck, MessageSquareWarning } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { DashboardData } from "./types"

export function OperationalHealthPanels({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InquiryRequiredPanel data={data} />
      <InventoryHealthPanel data={data} />
    </div>
  )
}

function InquiryRequiredPanel({ data }: { data: DashboardData }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-amber-200/60 shadow-sm flex flex-col h-[340px]">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
            <MessageSquareWarning className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Inquiry Required</h3>
        </div>
        {data.inquiryClaims.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
            {data.inquiryClaims.length} pending
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
        {data.inquiryClaims.length > 0 ? (
          data.inquiryClaims.map((claim) => (
            <div key={claim.id} className="flex items-start gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50/80 transition-colors">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-extrabold font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">{claim.claimCode}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{claim.foundItem.title}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate">{claim.claimantUser.name} {"\u00b7"} {claim.claimantUser.email}</p>
              </div>
              <Link to="/admin/claims" className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest text-amber-600 hover:text-amber-800 transition-colors">
                Review
              </Link>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 mb-3">
              <FileCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">All clear - no claims<br />require inquiry.</p>
          </div>
        )}
      </div>
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
