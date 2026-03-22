import type { CapturedItem } from "@/data/mockData"
import { X, Send, MapPin, Tag, Info, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface ReviewItemModalProps {
  item: CapturedItem
  onClose: () => void
  onPublish: () => void
}

export function ReviewItemModal({ item, onClose, onPublish }: ReviewItemModalProps) {
  const [title, setTitle] = useState(`${item.aiPrediction} found at ${item.suggestedLocation}`)
  const [category, setCategory] = useState(item.aiPrediction)
  const [description, setDescription] = useState("")
  const [storageLocation, setStorageLocation] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300">
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg"
        >
          <X className="w-5 h-5 text-slate-800" />
        </button>

        {/* Left Side: Photo Preview */}
        <div className="flex-1 bg-slate-100 relative group">
           <img src={item.imageUrl} alt="Captured" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
           <div className="absolute bottom-8 left-8">
              <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                AI Original Perspective
              </span>
           </div>
        </div>

        {/* Right Side: Form & Actions */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
           <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Capture</h2>
                <p className="text-slate-500 font-medium text-sm">Validate and publish this item to the gallery.</p>
              </div>
              <button 
                onClick={onClose}
                className="hidden md:flex p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
           </div>

           <div className="space-y-8 flex-1">
              {/* Field: Title */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" />
                    Item Title
                 </label>
                 <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-indigo-600 outline-none text-lg font-bold text-slate-800 transition-colors bg-transparent"
                    placeholder="e.g. Silver Laptop with Blue Sticker"
                 />
              </div>

              {/* Grid: Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Tag className="w-3.5 h-3.5" />
                       Category
                    </label>
                    <div className="relative">
                       <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full appearance-none bg-slate-50 px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
                       >
                          <option>Electronics</option>
                          <option>Wallets/IDs</option>
                          <option>Keys</option>
                          <option>Others</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5" />
                       Found Location
                    </label>
                    <input 
                       type="text" 
                       value={item.suggestedLocation}
                       readOnly
                       className="w-full bg-slate-50 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 border-none outline-none cursor-not-allowed"
                    />
                 </div>
              </div>

              {/* Field: Storage Location */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Physical Storage Location
                 </label>
                 <input 
                    type="text" 
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full bg-slate-50 px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="e.g. Cabinet B, Shelf 3"
                 />
              </div>

              {/* Field: Description */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Condition / Notes</label>
                 <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-100 h-32 resize-none"
                    placeholder="Add specific details about the item's condition..."
                 />
              </div>
           </div>

           <div className="pt-10 flex gap-4 mt-auto">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl border-2 font-bold text-slate-500"
              >
                Discard Capture
              </Button>
              <Button 
                onClick={onPublish}
                className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                <Send className="w-5 h-5" />
                Publish to Inventory
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}

