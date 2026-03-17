import React, { useState, useRef } from "react"
import { 
  Package, 
  MapPin, 
  Upload, 
  Plus, 
  X, 
  CheckCircle2,
  Camera,
  Archive
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"


export function LogNewItemModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(2) // Confirmation step
    }, 1500)
  }

  if (step === 2) {
    return (
      <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Item Logged Successfully</h3>
          <p className="text-slate-500 font-medium">ITEM-8293 has been added to the secure inventory.</p>
        </div>
        <div className="pt-4 flex gap-3">
          <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Log Another</Button>
          <Button className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl" onClick={onClose}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand uppercase tracking-tight">Log New Item</h2>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Core Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
             <Package className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">General Information</h4>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider font-bold text-slate-500">Item Title/Name</Label>
              <Input id="title" placeholder="e.g. Silver Ring with Blue Stone" required className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs uppercase tracking-wider font-bold text-slate-500">Category</Label>
                <Select id="category" className="h-11 bg-slate-50/50 border-slate-200 shadow-sm" required>
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="wallets">Wallets/IDs</option>
                  <option value="bags">Bags</option>
                  <option value="clothing">Clothing</option>
                  <option value="keys">Keys</option>
                  <option value="others">Others</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color" className="text-xs uppercase tracking-wider font-bold text-slate-500">Primary Color</Label>
                <Input id="color" placeholder="e.g. Silver, Black" className="h-11 bg-slate-50/50 border-slate-200 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Storage */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
             <MapPin className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Logistics & Storage</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs uppercase tracking-wider font-bold text-slate-500">Found At</Label>
              <Input id="location" placeholder="e.g. Lobby B" required className="h-11 bg-slate-50/50 border-slate-200 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storage" className="text-xs uppercase tracking-wider font-bold text-slate-500">Storage Location</Label>
              <Input id="storage" placeholder="e.g. Safe A-1" required className="h-11 bg-amber-50/30 border-amber-100 focus:bg-white transition-all shadow-sm font-medium" />
            </div>
          </div>
        </div>

        {/* Media Intake */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
             <Camera className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Visual Reference</h4>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-brand/20 transition-all group"
          >
            <input type="file" ref={fileInputRef} className="hidden" />
            <Upload className="w-6 h-6 text-slate-300 group-hover:text-brand mb-2 transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-brand transition-colors">Attach Physical Proof Photo</span>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
             <Archive className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Sensitive Discovery Notes</h4>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider font-bold text-slate-500">Notes (Only visible to Admin)</Label>
            <Textarea 
              id="notes" 
              placeholder="e.g. Found inside the wallet was a student ID for Juan Dela Cruz..."
              className="min-h-[100px] bg-slate-50 border-slate-200 shadow-sm text-slate-600"
            />
          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          className="flex-1 h-12 border-slate-200 font-bold uppercase tracking-widest text-xs"
        >
          Cancel
        </Button>
        <Button 
          disabled={isSubmitting}
          className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold uppercase tracking-widest text-xs shadow-sm rounded-xl transition-all active:scale-95"
        >
          {isSubmitting ? "Processing..." : "Log to Inventory"}
        </Button>
      </div>
    </div>
  )
}
