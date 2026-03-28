import { useEffect } from "react"
import { X, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface DenyClaimModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  denyReason: string
  setDenyReason: (reason: string) => void
}

export function DenyClaimModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  denyReason, 
  setDenyReason 
}: DenyClaimModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/80" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shadow-sm">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-rose-900 uppercase tracking-tight">Deny Claim Request</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Area */}
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm font-medium leading-relaxed">
              A reason for denial is mandatory. This message will be sent to the student to help them understand why their claim was rejected.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Reason for Denial</label>
            <textarea 
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="e.g. The serial number provided does not match our records or the uploaded proof is insufficient..."
              className="w-full min-h-[160px] bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm font-medium focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all outline-none shadow-inner resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-12 border-slate-200 font-bold uppercase tracking-widest text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            disabled={!denyReason.trim()}
            onClick={() => onConfirm(denyReason)}
            className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-xs shadow-sm rounded-xl transition-all active:scale-95"
          >
            Confirm Denial
          </Button>
        </div>
      </div>
    </div>
  )
}

