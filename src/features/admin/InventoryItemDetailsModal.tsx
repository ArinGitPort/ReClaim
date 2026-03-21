import { X, ExternalLink, ShieldCheck, Mail, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InventoryItemDetailsModalProps {
  item: any
  onClose: () => void
}

export function InventoryItemDetailsModal({ item, onClose }: InventoryItemDetailsModalProps) {
  return (
    <div className="bg-white flex flex-col h-full max-h-[95vh]">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
             {item.photoUrl ? (
               <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
             ) : (
               <ShieldCheck className="w-7 h-7 text-indigo-600" />
             )}
           </div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{item.title}</h2>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] font-mono mt-0.5">{item.code}</p>
           </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-slate-100">
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Core Info */}
          <div className="space-y-10">
             <DetailSection title="Record Metadata">
                <DetailItem icon={<Calendar className="w-4 h-4" />} label="Date Registered" value={item.date} />
                <DetailItem icon={<ShieldCheck className="w-4 h-4" />} label="Current Status" value={item.status} active />
                <DetailItem icon={<Mail className="w-4 h-4" />} label="Storage Location" value={item.storage} />
             </DetailSection>

             <DetailSection title="Detection Details">
                <DetailItem icon={<ExternalLink className="w-4 h-4" />} label="Physical Location" value={item.location} />
                <DetailItem icon={<ShieldCheck className="w-4 h-4" />} label="Discovery Context" value="Found near campus bench, appeared abandoned." />
             </DetailSection>
          </div>

          {/* Right Column: Ownership / Claims */}
          <div className="space-y-10">
             <DetailSection title="Claimant Information">
                {item.status === 'CLAIM_PENDING' ? (
                   <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                            <User className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Claimant</p>
                            <p className="text-sm font-bold text-slate-900">Johnathan Doe</p>
                         </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">Verified student ID. Claiming ownership of this item based on report #RC-9921.</p>
                   </div>
                ) : (
                   <div className="bg-slate-50 border border-slate-100 border-dashed rounded-3xl p-10 text-center">
                      <User className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Claims</p>
                      <p className="text-xs text-slate-400 mt-1">This item is currently unclaimed.</p>
                   </div>
                )}
             </DetailSection>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
        <Button 
          onClick={onClose}
          className="px-8 h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all"
        >
          Close Detail View
        </Button>
      </div>
    </div>
  )
}

function DetailSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-5">
       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{title}</h3>
       <div className="space-y-4">
          {children}
       </div>
    </div>
  )
}

function DetailItem({ icon, label, value, active }: { icon: React.ReactNode, label: string, value: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0 pb-3">
       <div className="flex items-center gap-3">
          <div className="text-slate-300">{icon}</div>
          <span className="text-xs font-bold text-slate-500">{label}</span>
       </div>
       <span className={`text-xs font-black ${active ? 'text-indigo-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  )
}

