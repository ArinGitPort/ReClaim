import { AlertTriangle, Trash2, Clock } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Skeleton } from "@/components/ui/Skeleton"
import { useSearchParams } from "react-router-dom"

type ExpiredItem = {
  id: string
  code: string
  title: string
  category: string
  foundLocation: string
  foundAtUtc: string
  status: string
}

export function ExpiredInventoryPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const [items, setItems] = useState<ExpiredItem[]>([])
  const [loading, setLoading] = useState(true)
  const [retentionDays, setRetentionDays] = useState(30)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDisposing, setIsDisposing] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 400)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const [res, settingsRes] = await Promise.all([
        api.get('/items/admin', { params: { expired: true, search: debouncedSearch || undefined } }),
        api.get<{ settings: { retentionPolicy: { foundItemRetentionDays: number } } }>('/settings'),
      ])
      setItems(res.data.items || [])
      setRetentionDays(settingsRes.data.settings.retentionPolicy.foundItemRetentionDays)
    } catch (err) {
      console.error("Failed to load expired items", err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const toggleSelect = (id: string) => {
    const newSec = new Set(selectedIds)
    if (newSec.has(id)) newSec.delete(id)
    else newSec.add(id)
    setSelectedIds(newSec)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i.id)))
    }
  }

  const handleBatchDispose = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to dispose ${selectedIds.size} items?`)) return

    try {
      setIsDisposing(true)
      await api.post('/items/batch-dispose', { itemIds: Array.from(selectedIds) })
      // Clear selection and refresh
      setSelectedIds(new Set())
      void fetchItems()
    } catch (err) {
      console.error("Failed to dispose items", err)
      alert("Failed to dispose items")
    } finally {
      setIsDisposing(false)
    }
  }

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Expired Inventory"
        description={`Manage items that have exceeded the ${retentionDays}-day retention period.`}
        actions={(
          <div className="flex gap-2">
            <Button
               onClick={handleBatchDispose}
               disabled={selectedIds.size === 0 || isDisposing}
               className="flex-1 sm:flex-initial h-10 px-4 bg-status-error hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm border-none disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100 disabled:shadow-none transition-colors">
              <Trash2 className="w-4 h-4 mr-2" />
              Dispose Selected ({selectedIds.size})
            </Button>
            <AdminExportButton disabled={items.length === 0} />
          </div>
        )}
      />

      <div className="space-y-3">
        <AdminListFilters>
          <AdminSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search expired items..."
          />

          <div className="w-full md:w-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-4 shadow-sm border-slate-200 text-slate-600 rounded-xl font-bold bg-white"
              onClick={() => {
                setSearchQuery("")
              }}
            >
              Reset
            </Button>
          </div>
        </AdminListFilters>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
          Showing {items.length} expired item{items.length === 1 ? "" : "s"}
        </p>
      </div>

      <AdminTableContainer>
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
              <tr>
                <th className="px-8 py-5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.size === items.length}
                    onChange={toggleSelectAll}
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
              ) : items.map((item) => {
                const foundDate = new Date(item.foundAtUtc);
                const expiredDays = Math.floor((Date.now() - foundDate.getTime()) / (1000 * 3600 * 24)) - retentionDays;

                return (
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition-all group cursor-default ${selectedIds.has(item.id) ? 'bg-slate-50' : ''} ${item.code.toUpperCase() === focusCode ? 'bg-brand/5 ring-2 ring-brand/20' : ''}`}>
                    <td className="px-8 py-5">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
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
                      <div className="text-xs text-slate-500">Found: {foundDate.toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="font-bold text-red-600">{expiredDays > 0 ? `${expiredDays} days ago` : 'Today'}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      </AdminTableContainer>
    </div>
  )
}
