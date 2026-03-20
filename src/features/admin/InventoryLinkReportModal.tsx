import { X, Link2, Search, Info, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface InventoryLinkReportModalProps {
  item: any
  onClose: () => void
  onLinked: () => void
}

export function InventoryLinkReportModal({ item, onClose, onLinked }: InventoryLinkReportModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLinking, setIsLinking] = useState(false)

  const handleLink = () => {
    setIsLinking(true)
    setTimeout(() => {
       setIsLinking(false)
       onLinked()
    }, 1200)
  }

  return (
    <div className="bg-white flex flex-col h-full max-h-[90vh]">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-sky-50 rounded-xl">
              <Link2 className="w-5 h-5 text-sky-600" />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Match with Lost Report</h2>
              <p className="text-slate-500 text-xs font-medium">Link this found item to a student's lost claim.</p>
           </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Item Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                 <Package className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Found Item</p>
                 <p className="text-sm font-bold text-slate-800">{item.title}</p>
              </div>
           </div>
           <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-3 py-1 rounded-md border border-slate-100">{item.code}</span>
        </div>

        {/* Search Reports */}
        <div className="space-y-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Search reports by student name, ID, or item title..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-100 outline-none transition-all shadow-sm"
              />
           </div>

           {/* Mock Results */}
           <div className="space-y-3">
              <ReportSuggestion name="Sarah Jenkins" reportId="LR-2900" title="Lost Silver Ring" date="2 hours ago" onSelect={handleLink} disabled={isLinking} />
              <ReportSuggestion name="Mike Peterson" reportId="LR-2850" title="Missing Keys" date="May 14" onSelect={handleLink} disabled={isLinking} />
           </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
         <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <Info className="w-5 h-5 text-sky-600 shrink-0" />
            <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
               Linking will notify the student that their item has been potentially found. Final verification remains required before handover.
            </p>
         </div>
      </div>
    </div>
  )
}

function ReportSuggestion({ name, reportId, title, date, onSelect, disabled }: { name: string, reportId: string, title: string, date: string, onSelect: () => void, disabled?: boolean }) {
  return (
    <div className="group bg-white hover:bg-sky-50/50 border border-slate-100 hover:border-sky-200 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer shadow-sm hover:shadow-md">
       <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px] group-hover:bg-sky-600 group-hover:text-white transition-colors">
             {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
             <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                {name} 
                <span className="text-[10px] font-mono font-bold text-slate-400">{reportId}</span>
             </p>
             <p className="text-[11px] font-bold text-slate-500 mt-0.5">{title} • <span className="text-slate-400">{date}</span></p>
          </div>
       </div>
       <Button 
          variant="outline" 
          onClick={onSelect}
          disabled={disabled}
          className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 hover:bg-sky-600 hover:text-white group-hover:border-sky-300 transition-all"
       >
          Select Match
       </Button>
    </div>
  )
}
