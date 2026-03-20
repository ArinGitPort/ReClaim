import { X, ShieldCheck, User, QrCode, ClipboardCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface InventoryHandoverModalProps {
  item: any
  onClose: () => void
  onCompleted: () => void
}

export function InventoryHandoverModal({ item, onClose, onCompleted }: InventoryHandoverModalProps) {
  const [step, setStep] = useState(1)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleNextStep = () => {
    if (step === 2) {
      setIsVerifying(true)
      setTimeout(() => {
        setIsVerifying(false)
        onCompleted()
      }, 1500)
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="bg-white flex flex-col h-full max-h-[90vh]">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Final Handover Protocol</h2>
              <p className="text-slate-500 text-xs font-medium italic">Handing over <span className="font-bold">{item.code}</span> to claimant.</p>
           </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-emerald-100 shadow-sm">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
         {step === 1 ? (
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
               <div className="space-y-2">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center border border-slate-100">
                     <QrCode className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-4">Scan Redemption QR</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">Student must present their unique redemption QR code from their mobile app.</p>
               </div>
               <div className="aspect-square w-48 mx-auto bg-slate-50 border border-slate-200 border-dashed rounded-3xl flex items-center justify-center opacity-50 relative group cursor-pointer hover:opacity-100 transition-opacity">
                  <div className="absolute inset-4 border-2 border-emerald-500/20 rounded-2xl animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Scan...</span>
               </div>
            </div>
         ) : (
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200 relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl">
                     <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-4">Identify Verification</h3>
                  <p className="text-sm font-bold text-emerald-600 mb-6">MATCH CONFIRMED</p>

                  <div className="space-y-4 text-left">
                     <VerificationRow label="Student Name" value="Johnathan Doe" />
                     <VerificationRow label="ID Suffix" value="**** 4920" />
                     <VerificationRow label="Item Claimed" value={item.title} />
                  </div>
               </div>
               
               <div className="flex items-center gap-3 bg-amber-50 p-5 rounded-2xl border border-amber-100 text-left">
                  <ClipboardCheck className="w-6 h-6 text-amber-600 shrink-0" />
                  <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                     ADMIN ACTION: PHYSICALLY HAND OVER THE ITEM AND CONFIRM RECEIPT.
                  </p>
               </div>
            </div>
         )}
      </div>

      <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
         <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-slate-400 uppercase tracking-widest text-[10px]"
         >
            Abort Protocol
         </Button>
         <Button 
            onClick={handleNextStep}
            disabled={isVerifying}
            className="flex-[2] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
         >
            {isVerifying ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <>
                  {step === 1 ? "Next Verification" : "Complete Secure Handover"}
                  <ArrowRight className="w-4 h-4" />
               </>
            )}
         </Button>
      </div>
    </div>
  )
}

function VerificationRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col border-b border-slate-200/50 pb-3 last:border-0 last:pb-0">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
       <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  )
}
