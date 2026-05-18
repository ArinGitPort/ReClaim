import { ArchiveRestore, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/Skeleton"
import { AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { formatShortDate } from "@/lib/formatters"
import type { DeletedItem } from "./types"

type DeletedItemsTableProps = {
  items: DeletedItem[]
  isLoading: boolean
  restoringId: string | null
  onRestore: (itemId: string) => void
}

export function DeletedItemsTable({ items, isLoading, restoringId, onRestore }: DeletedItemsTableProps) {
  return (
    <AdminTableContainer>
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
          <tr>
            <th className="px-8 py-5">Item</th>
            <th className="px-8 py-5">Category</th>
            <th className="px-8 py-5">Found Record</th>
            <th className="px-8 py-5">Storage</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={`deleted-skeleton-${index}`}>
                <td colSpan={5} className="px-8 py-4">
                  <Skeleton className="h-8 w-full" />
                </td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-slate-500">No deleted items found.</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-semibold text-slate-600">
                  {item.category} {"\u2022"} {item.color}
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-semibold text-slate-700">{item.foundLocation}</div>
                  <div className="text-xs text-slate-500">Found {formatShortDate(item.foundAtUtc)}</div>
                </td>
                <td className="px-8 py-5 text-sm font-semibold text-slate-600">
                  {item.storageLocation ?? "Not assigned"}
                </td>
                <td className="px-8 py-5 text-right">
                  <Button
                    type="button"
                    onClick={() => onRestore(item.id)}
                    disabled={restoringId === item.id}
                    className="h-9 px-3 bg-brand hover:bg-brand-active text-white text-[10px] font-bold uppercase tracking-widest"
                  >
                    <ArchiveRestore className="w-3.5 h-3.5 mr-1.5" />
                    {restoringId === item.id ? "Restoring..." : "Restore"}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableContainer>
  )
}
