import { ArrowRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusModal } from "@/components/ui/StatusModal"
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
      setRefNumber("REP-" + Math.random().toString(36).substring(2, 8).toUpperCase())
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <StatusModal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Active"
      message="Your missing item report has been logged. The Campus Admin Office will manually review your submission soon."
      bottomText={
        <>
          <FileText className="w-3.5 h-3.5 opacity-50" />
          Real-time verification history available
        </>
      }
      actions={
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
      }
    >
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left">
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
    </StatusModal>
  )
}

