import { X, Shield, MapPin, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface CampusDropOffModalProps {
  onClose: () => void
}

export function CampusDropOffModal({ onClose }: CampusDropOffModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-brand px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">Campus Drop-Off Guide</h2>
            <p className="text-white/80 font-medium max-w-sm">Found something? Here's how to return it to its rightful owner.</p>
          </div>
        </div>

        {/* Instructions Body */}
        <div className="px-8 py-10 space-y-10 bg-white">
          
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Shield className="w-6 h-6 text-brand" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-brand">Step 1: Secure the Item</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Please keep the item safe in your possession until you can officially turn it in. Do not leave it unattended in hallways or public areas.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-600">Step 2: Visit the ITSO Office</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Bring the found item directly to the <span className="text-slate-900 font-bold">ITSO Office (Building A)</span>. Our technical staff at this location is the designated team for managing the campus-wide Lost & Found database.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
              <ArrowRight className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600">Step 3: Hand it to the Staff</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Simply surrender the item to the personnel on duty. They will handle the technical process of logging the item into the system so the rightful owner can claim it.
              </p>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Available 8 AM - 6 PM Daily</span>
            </div>
            <Button 
              onClick={onClose}
              className="bg-brand hover:bg-brand/90 text-white font-bold rounded-xl px-6"
            >
              I Understand <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
