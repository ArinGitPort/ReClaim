import { useState } from "react"
import { 
  Search, 
  X, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Filter,
  ArrowRightLeft
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"

const inventoryMatches: Array<{ id: string; title: string; category: string; date: string; location: string; matchScore: number; status: string }> = []

export function MatchLinkingModal({ onClose, reportId, itemTitle }: { onClose: () => void; reportId: string; itemTitle: string }) {
  const [isLinking, setIsLinking] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleLink = () => {
    setIsLinking(true)
    setTimeout(() => {
      setIsLinking(false)
      setConfirmed(true)
    }, 1500)
  }

  if (confirmed) {
    return (
      <div className="p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Report Linked!</h3>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto text-sm">
            {reportId} is connected to the inventory. Student has been notified.
          </p>
        </div>
        <Button className="w-full h-12 bg-brand hover:bg-brand-active text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-sm" onClick={onClose}>Finish Workspace</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col max-h-[85vh] bg-white overflow-hidden rounded-xl">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Match Linker</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-2">
               Linking <span className="text-brand underline underline-offset-4">{reportId}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Matching Workspace */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/80">
        {/* Search Bar */}
        <div className="p-8 border-b border-slate-100 space-y-4 bg-white">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
            <Input 
              placeholder="Search Inventory by keywords..." 
              defaultValue={itemTitle}
              className="pl-12 h-12 bg-slate-50 border-slate-200 shadow-inner focus:bg-white focus:ring-4 focus:ring-brand/5 rounded-xl text-sm font-bold placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white text-[10px] h-8 font-black uppercase tracking-widest border-slate-200 text-slate-500 rounded-lg">
               <Filter className="w-3 h-3 mr-2" /> Show Only Electronics
            </Button>
          </div>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Potential Matches ({inventoryMatches.length})</h4>
          
          <div className="space-y-4">
             {inventoryMatches.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedMatch(item.id)}
                  className={cn(
                    "p-6 rounded-xl border transition-all cursor-pointer relative group flex items-start gap-4",
                    selectedMatch === item.id 
                      ? "bg-white border-brand shadow-xl ring-2 ring-brand/10 z-10" 
                      : "bg-white border-slate-200 shadow-sm hover:border-brand/30 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                    selectedMatch === item.id ? "bg-brand border-brand text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-brand/5 group-hover:text-brand"
                  )}>
                    <Package className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-12">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-500 font-mono tracking-tighter">{item.id}</span>
                        <StatusBadge weight={item.matchScore} />
                      </div>
                     <h5 className="font-bold text-slate-900 text-[17px] leading-tight mb-2 truncate group-hover:text-brand transition-colors tracking-tight">{item.title}</h5>
                                          <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                           <MapPin className="w-3.5 h-3.5" />
                           {item.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Calendar className="w-3.5 h-3.5" />
                           {item.date}
                        </div>
                      </div>
                  </div>

                  <div className={cn(
                    "absolute right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border transition-all",
                    selectedMatch === item.id 
                      ? "bg-brand border-brand text-white scale-110 shadow-sm" 
                      : "bg-slate-50 border-slate-200 text-slate-300 group-hover:border-brand/20 group-hover:text-brand/40"
                  )}>
                    {selectedMatch === item.id ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-4 h-4" />}
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="px-8 py-6 border-t border-slate-100 bg-white">
        {selectedMatch ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex-1 text-center sm:text-left">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-2">Ready to Connect</div>
               <div className="text-sm font-bold text-slate-900 tracking-tight">Manual verification of ownership confirmed.</div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none h-11 px-8 border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-500" onClick={() => setSelectedMatch(null)}>Change Choice</Button>
              <Button 
                onClick={handleLink}
                disabled={isLinking}
                className="flex-1 sm:flex-none h-11 px-10 bg-brand hover:opacity-90 text-white font-black uppercase tracking-widest text-[11px] shadow-sm rounded-xl transition-all active:scale-95"
              >
                {isLinking ? "Establishing Link..." : "Confirm & Notify"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 text-center text-slate-400">
             <div className="text-[10px] font-black uppercase tracking-[0.2em]">Select an inventory item to proceed with linking</div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ weight }: { weight: number }) {
  const getStyles = () => {
    if (weight > 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (weight > 50) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border",
      getStyles()
    )}>
      {weight}% AI PROBABILITY MATCH
    </span>
  )
}
