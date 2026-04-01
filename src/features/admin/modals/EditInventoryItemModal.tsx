import { useState } from "react"
import { X, Save, Package, MapPin, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { api } from "@/lib/api"
import { AxiosError } from "axios"
import {
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
  ITEM_COLORS,
  STORAGE_LOCATIONS,
} from "@/features/shared/constants"

type EditableItem = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundLocation: string
  foundAtUtc: string
  storage: string
  status: string
  privateDiscoveryNote?: string
}

const ITEM_STATUSES = ["AVAILABLE", "CLAIM_PENDING", "RETURNED", "ARCHIVED"] as const

export function EditInventoryItemModal({
  item,
  onClose,
  onSaved,
}: {
  item: EditableItem
  onClose: () => void
  onSaved?: () => void
}) {
  const [title, setTitle] = useState(item.title)
  const [category, setCategory] = useState(item.category)
  const [color, setColor] = useState(item.color)
  const [foundLocation, setFoundLocation] = useState(item.foundLocation)
  const [foundAtLocal, setFoundAtLocal] = useState(() => toLocalDatetimeInputValue(new Date(item.foundAtUtc)))
  const [storageLocation, setStorageLocation] = useState(item.storage)
  const [status, setStatus] = useState(item.status)
  const [privateDiscoveryNote, setPrivateDiscoveryNote] = useState(item.privateDiscoveryNote ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const foundAtDate = new Date(foundAtLocal)
      if (Number.isNaN(foundAtDate.getTime())) {
        throw new Error("Invalid found date/time")
      }

      await api.patch(`/items/${item.id}`, {
        title,
        category,
        color,
        foundLocation,
        foundAtUtc: foundAtDate.toISOString(),
        storageLocation,
        status,
        privateDiscoveryNote: privateDiscoveryNote || undefined,
      })

      onSaved?.()
      onClose()
    } catch (err) {
      const message = err instanceof AxiosError
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined
      setError(message ?? "Failed to update item.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
            <Save className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-brand uppercase tracking-tight">Edit Inventory Item</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1">{item.code}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form id="edit-item-form" onSubmit={(event) => void handleSubmit(event)} className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Package className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">General Information</h4>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs uppercase tracking-wider font-bold text-slate-500">Item Title/Name</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-11 bg-slate-50/50 border-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs uppercase tracking-wider font-bold text-slate-500">Category</Label>
              <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 bg-slate-50/50 border-slate-200" required>
                {ITEM_CATEGORIES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color" className="text-xs uppercase tracking-wider font-bold text-slate-500">Primary Color</Label>
              <Select id="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 bg-slate-50/50 border-slate-200" required>
                {ITEM_COLORS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Logistics & Status</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="foundLocation" className="text-xs uppercase tracking-wider font-bold text-slate-500">Found At</Label>
              <Select id="foundLocation" value={foundLocation} onChange={(e) => setFoundLocation(e.target.value)} className="h-11 bg-slate-50/50 border-slate-200" required>
                {CAMPUS_LOCATIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="foundAt" className="text-xs uppercase tracking-wider font-bold text-slate-500">Date & Time Found</Label>
              <Input id="foundAt" type="datetime-local" value={foundAtLocal} onChange={(e) => setFoundAtLocal(e.target.value)} required className="h-11 bg-slate-50/50 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storageLocation" className="text-xs uppercase tracking-wider font-bold text-slate-500">Storage Location</Label>
              <Select id="storageLocation" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} className="h-11 bg-slate-50/50 border-slate-200" required>
                {STORAGE_LOCATIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs uppercase tracking-wider font-bold text-slate-500">Status</Label>
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 bg-slate-50/50 border-slate-200" required>
                {ITEM_STATUSES.map((option) => (
                  <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Archive className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Sensitive Discovery Notes</h4>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="privateDiscoveryNote" className="text-xs uppercase tracking-wider font-bold text-slate-500">Notes (Only visible to Admin)</Label>
            <Textarea
              id="privateDiscoveryNote"
              value={privateDiscoveryNote}
              onChange={(e) => setPrivateDiscoveryNote(e.target.value)}
              placeholder="Add internal notes"
              className="min-h-[100px] bg-slate-50 border-slate-200 shadow-sm text-slate-600"
            />
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      </form>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 border-slate-200 font-bold uppercase tracking-widest text-xs">
          Cancel
        </Button>
        <Button type="submit" form="edit-item-form" disabled={isSubmitting} className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold uppercase tracking-widest text-xs shadow-sm rounded-xl transition-all active:scale-95">
          {isSubmitting ? "Saving..." : "Save Changes"}
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

