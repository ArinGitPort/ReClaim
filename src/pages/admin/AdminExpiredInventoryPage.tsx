import { AlertTriangle, Trash2, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"

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
  const [items, setItems] = useState<ExpiredItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDisposing, setIsDisposing] = useState(false)
  const [showDisposeConfirm, setShowDisposeConfirm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await api.get('/items/admin', { params: { expired: true, search: searchQuery || undefined } })
      setItems(res.data.items || [])
    } catch (err) {
      console.error("Failed to load expired items", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

    try {
      setIsDisposing(true)
      setActionError(null)
      await api.post('/items/batch-dispose', { itemIds: Array.from(selectedIds) })
      // Clear selection and refresh
      setSelectedIds(new Set())
      setShowDisposeConfirm(false)
      await fetchItems()
    } catch (err) {
      console.error("Failed to dispose items", err)
      setActionError("Failed to dispose selected items. Please try again.")
    } finally {
      setIsDisposing(false)
    }
  }

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Expired Inventory"
        description="Manage items that have exceeded their retention period."
        actions={(
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDisposeConfirm(true)}
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
          <table className="w-full text-left border-collapse min-w-250">
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
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-500">Loading expired items...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-500">No expired items found.</td>
                </tr>
              ) : items.map((item) => {
                const foundDate = new Date(item.foundAtUtc);
                const expiredDays = Math.floor((Date.now() - foundDate.getTime()) / (1000 * 3600 * 24)) - 30;

                return (
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition-all group cursor-default ${selectedIds.has(item.id) ? 'bg-slate-50' : ''}`}>
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

      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      )}

      <ConfirmActionModal
        isOpen={showDisposeConfirm}
        title="Dispose selected expired items?"
        description={`This action will permanently mark ${selectedIds.size} selected item${selectedIds.size === 1 ? "" : "s"} as disposed.`}
        confirmLabel="Yes, dispose"
        isLoading={isDisposing}
        onClose={() => {
          if (!isDisposing) {
            setShowDisposeConfirm(false)
          }
        }}
        onConfirm={() => void handleBatchDispose()}
      />
    </div>
  )
}
