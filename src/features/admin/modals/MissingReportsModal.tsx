import { PackageSearch } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import type { UserModalProps } from "@/features/admin/types"

export function MissingReportsModal({ isOpen, onClose, user }: UserModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
       <div className="p-6 border-b border-emerald-200 bg-emerald-50">
          <h3 className="font-extrabold text-lg text-emerald-900 flex items-center gap-2">
             <PackageSearch className="w-5 h-5 text-emerald-600" /> Active Missing Reports
          </h3>
          <p className="text-sm font-medium text-emerald-700/80">Items currently being auto-searched for {user.name}.</p>
       </div>
       <div className="p-6">
          {user.studentId ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-300">
                 <div>
                   <div className="font-bold text-slate-800">Water Bottle (Black Yeti)</div>
                   <div className="text-xs font-medium text-slate-500 mt-1">Lost near Gym • Reported 3 days ago</div>
                 </div>
                 <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-widest">
                   Auto-Scanning
                 </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-300">
                 <div>
                   <div className="font-bold text-slate-800">Keys with Red Lanyard</div>
                   <div className="text-xs font-medium text-slate-500 mt-1">Lost at Cafeteria Entry • Reported 1 week ago</div>
                 </div>
                 <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-widest">
                   Auto-Scanning
                 </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-slate-100 rounded-xl border-dashed">
               <div className="font-bold text-sm text-slate-500">No active reports filed.</div>
            </div>
          )}
       </div>
    </Modal>
  )
}
