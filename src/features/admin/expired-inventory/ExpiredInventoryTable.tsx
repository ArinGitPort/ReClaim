import { AlertTriangle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/Skeleton"
import { AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { formatShortDate } from "@/lib/formatters"
import { formatExpiredSince } from "./expiredInventoryUtils"
import type { ExpiredItem } from "./types"

type ExpiredInventoryTableProps = {
  items: ExpiredItem[]
  loading: boolean
  retentionDays: number
  selectedIds: Set<string>
  focusCode: string
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
}

export function ExpiredInventoryTable({
  items,
  loading,
  retentionDays,
  selectedIds,
  focusCode,
  onToggleSelect,
  onToggleSelectAll,
}: ExpiredInventoryTableProps) {
  return (
    <AdminTableContainer>
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
          <tr>
            <th className="px-8 py-5 w-10 text-center">
              <input
                type="checkbox"
                checked={items.length > 0 && selectedIds.size === items.length}
                onChange={onToggleSelectAll}
                disabled={items.length === 0}
                className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
            </th>
            <th className="px-8 py-5">Item Details</th>
            <th className="px-8 py-5">Found Location</th>
            <th className="px-8 py-5">Expired Since</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <tr key={`expired-skeleton-${index}`}>
                <td colSpan={4} className="px-8 py-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-10 text-slate-500">No expired items found.</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className={`hover:bg-slate-50/80 transition-all group cursor-default ${selectedIds.has(item.id) ? "bg-slate-50" : ""} ${item.code.toUpperCase() === focusCode ? "bg-brand/5 ring-2 ring-brand/20" : ""}`}>
                <td className="px-8 py-5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                  />
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                      <AlertTriangle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {item.title}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">#{item.code}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Category: {item.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-semibold text-slate-700">{item.foundLocation}</div>
                  <div className="text-xs text-slate-500">Found: {formatShortDate(item.foundAtUtc)}</div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="font-bold text-red-600">{formatExpiredSince(item.foundAtUtc, retentionDays)}</span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableContainer>
  )
}
