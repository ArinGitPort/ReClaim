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

// Mock Inventory Data for Matching
const MOCK_MATCHES = [
  { id: "ITEM-8291", title: "Apple MacBook Pro M2", category: "Electronics", date: "2024-03-15", location: "Library - 2nd Floor", matchScore: 92, status: "Available" },
  { id: "ITEM-1022", title: "Grey ASUS Zenbook", category: "Electronics", date: "2024-03-12", location: "Cafeteria", matchScore: 65, status: "Available" },
  { id: "ITEM-0912", title: "Laptop Charger (Mac)", category: "Electronics", date: "2024-03-10", location: "Library", matchScore: 40, status: "Available" },
]

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
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Report Linked!</h3>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {reportId} is now formally connected to the inventory record. Student has been notified via email.
          </p>
        </div>
        <Button className="w-full h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl" onClick={onClose}>Finish Workspace</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[80vh] bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand uppercase tracking-tight">Manual Match Linker</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
               Linking <span className="text-brand underline underline-offset-2">{reportId} ({itemTitle})</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Matching Workspace */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
            <Input 
              placeholder="Search Inventory by keywords, category, or color..." 
              defaultValue={itemTitle}
              className="pl-12 h-12 bg-white border-slate-200 shadow-sm transition-all focus:ring-4 focus:ring-brand/5 rounded-xl text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white text-[10px] h-8 font-bold uppercase tracking-widest border-slate-200">
               <Filter className="w-3 h-3 mr-2" /> Show Only Electronics
            </Button>
          </div>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Potential Inventory Matches ({MOCK_MATCHES.length})</h4>
          
          <div className="space-y-3">
             {MOCK_MATCHES.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedMatch(item.id)}
                  className={cn(
                    "p-5 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-4",
                    selectedMatch === item.id 
                      ? "bg-white border-brand shadow-xl ring-4 ring-brand/5" 
                      : "bg-white border-slate-100 hover:border-brand/20 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                    selectedMatch === item.id ? "bg-[#1E2F85] border-[#1E2F85] text-white" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-[#1E2F85]/5 group-hover:text-[#1E2F85]"
                  )}>
                    <Package className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-12">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{item.id}</span>
                        <StatusBadge weight={item.matchScore} />
                     </div>
                     <h5 className="font-extrabold text-slate-800 text-base leading-tight mb-2 truncate group-hover:text-brand transition-colors">{item.title}</h5>
                     
                     <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
                        <div className="flex items-center gap-1.5">
                           <MapPin className="w-3 h-3" />
                           {item.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Calendar className="w-3 h-3" />
                           {item.date}
                        </div>
                     </div>
                  </div>

                  <div className={cn(
                    "absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                    selectedMatch === item.id 
                      ? "bg-[#1E2F85] border-[#1E2F85] text-white scale-110 shadow-lg shadow-[#1E2F85]/20" 
                      : "bg-slate-50 border-slate-100 text-slate-200 group-hover:text-[#1E2F85]/40"
                  )}>
                    {selectedMatch === item.id ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-4 h-4" />}
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="p-6 border-t border-slate-100 bg-white">
        {selectedMatch ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex-1 text-center sm:text-left">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Ready to Connect</div>
               <div className="text-sm font-bold text-[#1E2F85]">Manual verification of ownership confirmed.</div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none h-11 px-8 border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => setSelectedMatch(null)}>Change Choice</Button>
              <Button 
                onClick={handleLink}
                disabled={isLinking}
                className="flex-1 sm:flex-none h-11 px-10 bg-[#1E2F85] hover:bg-[#172363] text-white font-bold shadow-lg shadow-[#1E2F85]/20 rounded-xl transition-all active:scale-95"
              >
                {isLinking ? "Establishing Link..." : "Confirm & Notify"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 text-center text-slate-400">
             <div className="text-[11px] font-extrabold uppercase tracking-widest">Select an inventory item to proceed with linking</div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ weight }: { weight: number }) {
  const getStyles = () => {
    if (weight > 80) return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    if (weight > 50) return 'bg-orange-50 text-orange-700 border-orange-100'
    return 'bg-slate-50 text-slate-500 border-slate-100'
  }

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-tighter border",
      getStyles()
    )}>
      {weight}% AI PROBABILITY MATCH
    </span>
  )
}
