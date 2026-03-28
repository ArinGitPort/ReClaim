import { Search, Filter, AlertTriangle, Trash2, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

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
    if (!confirm(`Are you sure you want to dispose ${selectedIds.size} items?`)) return

    try {
      setIsDisposing(true)
      await api.post('/items/batch-dispose', { itemIds: Array.from(selectedIds) })
      // Clear selection and refresh
      setSelectedIds(new Set())
      fetchItems()
    } catch (err) {
      console.error("Failed to dispose items", err)
      alert("Failed to dispose items")
    } finally {
      setIsDisposing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Expired Inventory</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Management of items past the institutional holding period.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm">
             <Filter className="w-4 h-4" /> Type
           </button>
           <button 
             onClick={handleBatchDispose}
             disabled={selectedIds.size === 0 || isDisposing}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50">
             <Trash2 className="w-4 h-4" /> Dispose Selected ({selectedIds.size})
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex align-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expired items..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-4 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={items.length > 0 && selectedIds.size === items.length}
                    onChange={toggleSelectAll}
                    disabled={items.length === 0}
                    className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand" 
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Found Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expired Since</th>
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
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(item.id) ? 'bg-slate-50' : ''}`}>
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand" 
                      />
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-700">{item.foundLocation}</div>
                      <div className="text-xs text-slate-500">Found: {foundDate.toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
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
        </div>
      </div>
    </div>
  )
}
