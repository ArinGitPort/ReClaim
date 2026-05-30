import { Image as ImageIcon, Info, MapPin, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModalHeader } from "@/components/ui/ModalHeader"

export type QuickMatchItemDetails = {
  code: string
  title: string
  category: string
  color: string
  foundLocation: string
  foundAtUtc: string
  storage: string
  status: string
  privateDiscoveryNote?: string
  photoUrl?: string
  matchScore?: number
}

export function QuickMatchReviewModal({
  item,
  onClose,
  onConfirmMatch,
  isConfirming = false,
}: {
  item: QuickMatchItemDetails
  onClose: () => void
  onConfirmMatch: () => void
  isConfirming?: boolean
}) {
  return (
    <div className="flex flex-col max-h-[85vh] bg-white overflow-hidden rounded-xl">
      <ModalHeader
        title="Quick Match Verification"
        subtitle={item.code}
        icon={<Sparkles className="w-6 h-6 text-white" />}
        onClose={onClose}
        containerClassName="px-8 py-6 bg-brand"
        titleClassName="text-white"
      />

      <div className="p-8 overflow-y-auto space-y-6 bg-slate-50/60">
        {item.matchScore !== undefined && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 mb-0.5">System Recommendation</div>
              <div className="text-[13px] font-bold text-emerald-900">This item is a <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-black">{item.matchScore}% AI Match</span> to the reported missing item.</div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={item.title} className="w-full h-60 object-cover" />
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-8 h-8 mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No image uploaded</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard icon={<Package className="w-4 h-4" />} label="Title" value={item.title} />
          <InfoCard icon={<Package className="w-4 h-4" />} label="Category" value={item.category} />
          <InfoCard icon={<Package className="w-4 h-4" />} label="Color" value={item.color} />
          <InfoCard icon={<MapPin className="w-4 h-4" />} label="Found At" value={item.foundLocation} />
          <InfoCard icon={<MapPin className="w-4 h-4" />} label="Found Date" value={item.foundAtUtc ? new Date(item.foundAtUtc).toLocaleString() : "Unknown"} />
          <InfoCard icon={<MapPin className="w-4 h-4" />} label="Storage" value={item.storage} />
          <InfoCard icon={<Info className="w-4 h-4" />} label="Status" value={item.status ? item.status.replaceAll("_", " ") : "Unknown"} />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-2">Sensitive Discovery Note</div>
          <p className="text-sm font-semibold text-amber-900">{item.privateDiscoveryNote || "No sensitive notes recorded."}</p>
        </div>
      </div>

      <div className="px-8 py-5 border-t border-slate-100 bg-white flex gap-3">
        <Button variant="outline" onClick={onClose} disabled={isConfirming} className="flex-1 h-11 border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[11px]">Cancel</Button>
        <Button onClick={onConfirmMatch} disabled={isConfirming} className="flex-1 h-11 bg-brand hover:bg-brand-active text-white font-black uppercase tracking-widest text-[11px] shadow-sm">
          {isConfirming ? "Matching..." : "Confirm Match"}
        </Button>
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-1">{icon} {label}</div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
    </div>
  )
}
