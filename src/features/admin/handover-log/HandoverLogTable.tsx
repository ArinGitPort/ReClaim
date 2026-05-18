import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/Skeleton"
import { AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { formatDateTime } from "@/lib/formatters"
import type { HandoverLogRow } from "./types"

type HandoverLogTableProps = {
  logs: HandoverLogRow[]
  isLoading: boolean
  onSelectLog: (log: HandoverLogRow) => void
}

export function HandoverLogTable({ logs, isLoading, onSelectLog }: HandoverLogTableProps) {
  return (
    <AdminTableContainer>
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
            <th className="px-8 py-5">Released At</th>
            <th className="px-8 py-5">Item</th>
            <th className="px-8 py-5">Claim</th>
            <th className="px-8 py-5">Token</th>
            <th className="px-8 py-5">Released To</th>
            <th className="px-8 py-5">Notes</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
              <td className="px-8 py-5 text-xs font-semibold text-slate-600">{formatDateTime(log.releasedAtUtc)}</td>
              <td className="px-8 py-5">
                <div className="text-xs font-bold text-slate-800">{log.foundItem.code}</div>
                <div className="text-xs font-semibold text-slate-500">{log.foundItem.title} {"\u2022"} {log.foundItem.category}</div>
              </td>
              <td className="px-8 py-5 text-xs font-semibold text-slate-600">{log.claim?.claimCode ?? "N/A"}</td>
              <td className="px-8 py-5 text-xs font-bold text-slate-700 font-mono">{log.pickupTokenPresented}</td>
              <td className="px-8 py-5">
                <div className="text-xs font-bold text-slate-800">{log.releasedToUser.name}</div>
                <div className="text-xs font-semibold text-slate-500">{log.releasedToUser.studentId ?? "N/A"}</div>
              </td>
              <td className="px-8 py-5 text-xs font-semibold text-slate-600">{log.note?.trim() ? log.note : "-"}</td>
              <td className="px-8 py-5 text-right">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSelectLog(log)}
                  className="h-8 border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                </Button>
              </td>
            </tr>
          ))}
          {isLoading && <HandoverLogSkeleton />}
          {!isLoading && logs.length === 0 && (
            <tr>
              <td colSpan={7} className="px-8 py-8 text-center text-sm font-semibold text-slate-500">No returned-item handover logs found for current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminTableContainer>
  )
}

function HandoverLogSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={`handover-skeleton-${index}`}>
          <td colSpan={7} className="px-8 py-4">
            <div className="grid grid-cols-7 gap-4 items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}
