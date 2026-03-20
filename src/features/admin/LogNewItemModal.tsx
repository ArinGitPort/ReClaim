import { useEffect, useRef, useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { api } from "@/lib/api"
import { AxiosError } from "axios"
import {
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
  ITEM_COLORS,
  STORAGE_LOCATIONS,
} from "@/features/admin/itemFormOptions"
import { requiresColorSelection } from "@/features/shared/itemCategoryRules"


export function LogNewItemModal({ onClose, onSaved }: { onClose: () => void; onSaved?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [savedCode, setSavedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [color, setColor] = useState("")
  const [foundLocation, setFoundLocation] = useState("")
  const [foundAtLocal, setFoundAtLocal] = useState(() => toLocalDatetimeInputValue(new Date()))
  const [storageLocation, setStorageLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const needsColor = requiresColorSelection(category)

  useEffect(() => {
    if (!needsColor && color) {
      setColor("")
    }
  }, [needsColor, color])

  const resetForm = () => {
    setTitle("")
    setCategory("")
    setColor("")
    setFoundLocation("")
    setFoundAtLocal(toLocalDatetimeInputValue(new Date()))
    setStorageLocation("")
    setNotes("")
    setPhotoFile(null)
    setError(null)
    setSavedCode(null)
  }

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("photo", file)

    const response = await api.post<{ photoUrl: string }>("/items/upload-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data.photoUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const foundDate = new Date(foundAtLocal)
      if (Number.isNaN(foundDate.getTime())) {
        throw new Error("Please provide a valid date and time found.")
      }

      const photoUrl = photoFile ? await uploadPhoto(photoFile) : undefined

      const response = await api.post<{ item: { code: string } }>("/items", {
        title,
        category,
        color: needsColor ? color : "Not Specified",
        foundLocation,
        foundAtUtc: foundDate.toISOString(),
        photoUrl,
        publicDescription: `${title} reported by admin inventory intake`,
        privateDiscoveryNote: notes || undefined,
        privateData: photoUrl ? { photoUrl } : undefined,
        storageLocation,
      })

      setSavedCode(response.data.item.code)
      onSaved?.()
      setIsSubmitting(false)
      setStep(2)
    } catch (err) {
      const message = err instanceof AxiosError
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined
      setError(message ?? "Failed to log item. Please check required fields and try again.")
      setIsSubmitting(false)
    }
  }

  if (step === 2) {
    return (
      <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Item Logged Successfully</h3>
          <p className="text-slate-500 font-medium">{savedCode ?? "Item"} has been added to the secure inventory.</p>
        </div>
        <div className="pt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => {
              resetForm()
              setStep(1)
            }}
          >
            Log Another
          </Button>
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
      <form id="log-new-item-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Core Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
             <Package className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">General Information</h4>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider font-bold text-slate-500">Item Title/Name</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Silver Ring with Blue Stone" required className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs uppercase tracking-wider font-bold text-slate-500">Category</Label>
                <Select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 bg-slate-50/50 border-slate-200 shadow-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {ITEM_CATEGORIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>
              {needsColor ? (
                <div className="space-y-1.5">
                  <Label htmlFor="color" className="text-xs uppercase tracking-wider font-bold text-slate-500">Primary Color</Label>
                  <Select id="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 bg-slate-50/50 border-slate-200 shadow-sm" required={needsColor}>
                    <option value="">Select Color</option>
                    {ITEM_COLORS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Primary Color</Label>
                  <div className="h-11 px-3 rounded-md border border-slate-200 bg-slate-100 text-slate-500 text-sm font-semibold flex items-center">
                    Not required for this category
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location & Storage */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
             <MapPin className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Logistics & Storage</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="foundLocation" className="text-xs uppercase tracking-wider font-bold text-slate-500">Found At</Label>
              <Select
                id="foundLocation"
                value={foundLocation}
                onChange={(e) => setFoundLocation(e.target.value)}
                className="h-11 bg-slate-50/50 border-slate-200 shadow-sm"
                required
              >
                <option value="">Select Campus Zone</option>
                {CAMPUS_LOCATIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="foundAt" className="text-xs uppercase tracking-wider font-bold text-slate-500">Date & Time Found</Label>
              <Input
                id="foundAt"
                type="datetime-local"
                value={foundAtLocal}
                onChange={(e) => setFoundAtLocal(e.target.value)}
                required
                className="h-11 bg-slate-50/50 border-slate-200 shadow-sm"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="storageLocation" className="text-xs uppercase tracking-wider font-bold text-slate-500">Storage Location</Label>
              <Select
                id="storageLocation"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="h-11 bg-amber-50/30 border-amber-100 focus:bg-white transition-all shadow-sm font-medium"
                required
              >
                <option value="">Select Storage</option>
                {STORAGE_LOCATIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
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
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              ref={fileInputRef}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                setPhotoFile(file)
              }}
            />
            <Upload className="w-6 h-6 text-slate-300 group-hover:text-brand mb-2 transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-brand transition-colors">
              {photoFile ? `Selected: ${photoFile.name}` : "Attach Physical Proof Photo"}
            </span>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
             <Archive className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Sensitive Discovery Notes</h4>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider font-bold text-slate-500">Additional Notes (Only for Admin)</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add extra intake details for verification and handling."
              className="min-h-25 bg-slate-50 border-slate-200 shadow-sm text-slate-600"
            />
          </div>
        </div>
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
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
          type="submit"
          form="log-new-item-form"
          disabled={isSubmitting}
          className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold uppercase tracking-widest text-xs shadow-sm rounded-xl transition-all active:scale-95"
        >
          {isSubmitting ? "Processing..." : "Log to Inventory"}
        </Button>
      </div>
    </div>
  )
}

function toLocalDatetimeInputValue(date: Date): string {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

