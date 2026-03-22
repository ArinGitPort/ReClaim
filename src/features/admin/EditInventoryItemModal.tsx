import { useState } from "react"
import { X, Save, Edit2, MapPin, Tag, Info, ShieldCheck, Archive } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface EditInventoryItemModalProps {
  item: any
  onClose: () => void
  onSaved: () => void
}

export function EditInventoryItemModal({ item, onClose, onSaved }: EditInventoryItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [status, setStatus] = useState(item.status)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onSaved()
    }, 800)
  }

  return (
    <div className="bg-white flex flex-col h-full max-h-[90vh]">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-indigo-600" />
            Edit Item Record
          </h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest font-mono">ID: {item.code}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Info className="w-3.5 h-3.5" /> Item Title
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Operational Status
              </label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none"
              >
                <option value="AVAILABLE">Available</option>
                <option value="CLAIM_PENDING">Claim Pending</option>
                <option value="RETURNED">Returned</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Archive className="w-3.5 h-3.5" /> Category
              </label>
              <input 
                type="text" 
                value={item.category}
                readOnly
                className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Found Location
            </label>
            <input 
              type="text" 
              value={item.location}
              readOnly
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Storage Facility
            </label>
            <input 
              type="text" 
              defaultValue={item.storage}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="e.g. Shelf 4"
            />
          </div>
        </div>
      </form>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-500"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Update Record
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

