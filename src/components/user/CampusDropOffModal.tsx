import { X, Shield, MapPin, Camera, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

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
                Thank you for helping keep our campus honest! Please hold onto the item and do not leave it unattended.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-600">Step 2: Go to the Smart Drop-Off Station</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Bring the item to the <span className="text-slate-900 font-bold">Lost & Found Desk</span> located at the <span className="text-slate-900 font-bold">Student Affairs Office (Building A, Room 102)</span>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Camera className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600">Step 3: Place Under the Camera</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Place the item under our AI-integrated camera scanner. The system will automatically log the item, snap a photo, and add it to the public gallery.
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
