import { AlertCircle, CheckCircle } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import type { UserModalProps } from "@/features/admin/types"

export function PendingVerificationsModal({ isOpen, onClose, user }: UserModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
       <div className="p-6 border-b border-amber-200 bg-amber-50">
          <h3 className="font-extrabold text-lg text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" /> Action Required: Claims
          </h3>
          <p className="text-sm font-medium text-amber-700/80">Pending proofs associated with {user.name}.</p>
       </div>
       <div className="p-6">
          {user._count.claims > 0 ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300">
                 <div>
                   <div className="font-bold text-slate-800">Apple AirPods Pro</div>
                   <div className="text-xs font-medium text-slate-500 mt-1">Found Location: Library • Claim submitted yesterday</div>
                 </div>
                 <Button className="h-8 text-[10px] font-bold uppercase tracking-widest bg-brand hover:bg-brand-active border-none text-white">
                   Evaluate Proof
                 </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-slate-100 rounded-xl border-dashed">
               <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
               <div className="font-bold text-sm text-slate-500">No pending verifications required.</div>
            </div>
          )}
       </div>
    </Modal>
  )
}
