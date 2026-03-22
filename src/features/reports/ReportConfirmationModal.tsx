import { CheckCircle, ArrowRight, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

interface ReportConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportConfirmationModal({ isOpen, onClose }: ReportConfirmationModalProps) {
  const [refNumber, setRefNumber] = useState("")

  useEffect(() => {
    if (isOpen) {
      setRefNumber("REC-" + Math.random().toString(36).substr(2, 9).toUpperCase())
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
      {/* Backdrop - Clean, no blur */}
      <div
        className="fixed inset-0 bg-slate-900/80"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-8 sm:p-10 text-center my-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle className="w-8 h-8 text-brand" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-none">Report Active</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
          Your missing item report has been logged. The Campus Admin Office will manually review your submission soon.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 text-left">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reference #</span>
            <span className="text-sm font-mono font-black text-slate-700">{refNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand text-[10px] font-black rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
              Submitted
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full h-12 font-black bg-brand hover:bg-brand/90 transition-all active:scale-95 shadow-sm" onClick={onClose}>
            <Link to="/my-reports">
              VIEW MY REPORTS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" className="w-full h-12 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl uppercase tracking-widest text-[11px]" onClick={onClose}>
            Back to Form
          </Button>
        </div>

        <p className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <FileText className="w-3.5 h-3.5 opacity-50" />
          Real-time verification history available
        </p>
      </div>
    </div>
  )
}

