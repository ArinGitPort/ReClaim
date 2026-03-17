import { CheckCircle2, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useEffect } from "react"

interface ClaimSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  claimId: string
}

export function ClaimSuccessModal({ isOpen, onClose, claimId }: ClaimSuccessModalProps) {
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
      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-8 sm:p-12 text-center my-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3 leading-none uppercase">Claim Processed</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
          The verification for <span className="text-slate-900 font-bold">{claimId}</span> has been completed. The student will receive an official notification shortly.
        </p>

        <div className="space-y-3">
          <Button 
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-sm"
            onClick={onClose}
          >
            Return to Queue
            <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            System Ledger Updated
          </p>
        </div>
      </div>
    </div>
  )
}
