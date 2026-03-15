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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-brand" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Report Active</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Your missing item report has been successfully logged. Our Campus Admin Office will manually review your submission.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference #</span>
            <span className="text-sm font-mono font-bold text-slate-700">{refNumber}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Status</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
              Submitted
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full h-12 font-bold shadow-lg shadow-brand/20" onClick={onClose}>
            <Link to="/my-reports">
              View My Reports
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" className="w-full h-12 font-semibold" onClick={onClose}>
            Back to Form
          </Button>
        </div>

        <p className="mt-8 text-[10px] text-slate-400 flex items-center justify-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Verification history will be updated in real-time.
        </p>
      </div>
    </div>
  )
}
