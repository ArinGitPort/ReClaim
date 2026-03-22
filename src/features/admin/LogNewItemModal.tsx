import { useState } from "react"
import { X, Save, Camera, MapPin, Tag, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface LogNewItemModalProps {
  onClose: () => void
  onSaved: () => void
}

export function LogNewItemModal({ onClose, onSaved }: LogNewItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Log Physical Discovery</h2>
          <p className="text-slate-500 text-xs font-medium">Securly register a newly found item into the campus inventory.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Photo Upload Placeholder */}
        <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center group hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
           <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600">Upload Item Evidence</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Info className="w-3.5 h-3.5" /> Item Title
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Blue HydroFlask with stickers"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Category
              </label>
              <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none">
                <option>Electronics</option>
                <option>Water Bottles</option>
                <option>Clothing</option>
                <option>Wallets/IDs</option>
                <option>Keys</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Found Location
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Library Level 2"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Physical Storage Location
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Cabinet A, Shelf 3"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none"
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
              Commit to Inventory
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

