import { useState } from "react"
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  MoreVertical,
  Edit,
  Link2,
  Package,
  MapPin,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { LogNewItemModal } from "@/features/admin/LogNewItemModal"

const inventoryItems: Array<{ id: string; title: string; category: string; date: string; location: string; status: string; storage: string }> = []

export function InventoryPage() {
  const [search, setSearch] = useState("")
  const [showFastEntry, setShowFastEntry] = useState(false)

  return (
    <div className="space-y-8">
      {showFastEntry && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setShowFastEntry(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
            <LogNewItemModal onClose={() => setShowFastEntry(false)} />
          </div>
        </div>
      )}

      {/* Consistent Header Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Control</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and audit all securely logged physical items.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowFastEntry(true)}
            className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log New Item
          </Button>
          <Button variant="outline" className="h-10 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* List Search and Filter Area */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
          <Input 
            placeholder="Search by Item ID, Title, or Description..." 
            className="pl-12 h-12 bg-white border-slate-200 shadow-sm focus:ring-brand/10 text-sm font-medium rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-400">
                <th className="px-8 py-5">Item Identifier</th>
                <th className="px-8 py-5">Found Item Specifications</th>
                <th className="px-8 py-5">Detection Record</th>
                <th className="px-8 py-5">Storage Facility</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-[11px] font-bold text-slate-500 font-mono tracking-tighter bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all">
                      {item.id}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 tracking-tight">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600 text-[12px] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                        <span className="truncate max-w-[120px]">{item.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/50 text-[11px] font-bold text-slate-600 font-mono">
                      {item.storage}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all shadow-sm bg-white border border-slate-100" title="Modify Entry">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100" title="Link Report">
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {inventoryItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-14 text-center text-slate-400 text-sm font-semibold">
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Compact Table Footer */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
             <div className="w-2 h-2 rounded-full bg-brand/30" />
             Showing {inventoryItems.length} entries
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 hover:text-brand transition-colors disabled:opacity-30 flex items-center gap-2" disabled>
              Previous
            </button>
            <div className="flex items-center gap-1.5">
               <span className="w-7 h-7 bg-white shadow-sm border border-slate-200 rounded-lg flex items-center justify-center text-brand text-xs">1</span>
               <span className="text-slate-300">/</span>
               <span className="text-xs">28</span>
            </div>
            <button className="px-4 py-2 hover:text-brand transition-colors flex items-center gap-2">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const getStyles = () => {
    switch(status) {
      case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'Claim Pending': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'Returned': return 'bg-slate-50 text-slate-500 border-slate-100'
      case 'Archived': return 'bg-rose-50 text-rose-700 border-rose-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-100'
    }
  }

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm inline-flex items-center gap-2",
      getStyles()
    )}>
      {status === 'Claim Pending' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {status}
    </span>
  )
}
