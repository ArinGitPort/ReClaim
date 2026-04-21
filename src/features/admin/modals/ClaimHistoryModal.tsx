import { History } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import type { UserModalProps } from "@/features/admin/types"

export function ClaimHistoryModal({ isOpen, onClose, user }: UserModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
       <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
             <History className="w-5 h-5 text-slate-600" /> Lifetime Claims History
          </h3>
          <p className="text-sm font-medium text-slate-500">Historical logs of items claimed and returned to {user.name}.</p>
       </div>
       <div className="p-6">
          {user._count.claims > 0 ? (
             <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50 shadow-inner">
                <div className="font-bold text-sm text-slate-500">Archived history records require elevated data-fetch privileges.</div>
             </div>
          ) : (
             <div className="p-8 text-center border border-slate-100 rounded-xl border-dashed">
                <div className="font-bold text-sm text-slate-500">No claims submitted historically.</div>
             </div>
          )}
       </div>
    </Modal>
  )
}
