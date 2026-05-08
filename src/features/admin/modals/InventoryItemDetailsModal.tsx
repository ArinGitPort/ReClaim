import { Image as ImageIcon, Info, MapPin, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModalHeader } from "@/components/ui/ModalHeader"

type InventoryItemDetails = {
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
}

export function InventoryItemDetailsModal({
  item,
  onClose,
}: {
  item: InventoryItemDetails
  onClose: () => void
}) {
  return (
    <div className="flex flex-col max-h-[85vh] bg-white overflow-hidden rounded-xl">
      <ModalHeader
        title="Item Details"
        subtitle={item.code}
        icon={<Info className="w-6 h-6 text-white" />}
        onClose={onClose}
        containerClassName="px-8 py-6 bg-white"
        titleClassName="text-slate-900"
      />

      <div className="p-8 overflow-y-auto space-y-6 bg-slate-50/60">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
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
          <InfoCard icon={<MapPin className="w-4 h-4" />} label="Found Date" value={new Date(item.foundAtUtc).toLocaleString()} />
          <InfoCard icon={<MapPin className="w-4 h-4" />} label="Storage" value={item.storage} />
          <InfoCard icon={<Info className="w-4 h-4" />} label="Status" value={item.status.replaceAll("_", " ")} />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-2">Sensitive Discovery Note</div>
          <p className="text-sm font-semibold text-amber-900">{item.privateDiscoveryNote || "No sensitive notes recorded."}</p>
        </div>
      </div>

      <div className="px-8 py-5 border-t border-slate-100 bg-white">
        <Button onClick={onClose} className="w-full h-11 bg-brand hover:bg-brand-active text-white">Close</Button>
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

