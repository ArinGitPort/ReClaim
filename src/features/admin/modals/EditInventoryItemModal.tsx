import { useState } from "react"
import { Save, Package, MapPin, Archive, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Switch } from "@/components/ui/Switch"
import { Textarea } from "@/components/ui/Textarea"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { api } from "@/lib/api"
import { AxiosError } from "axios"
import {
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
  ITEM_COLORS,
  STORAGE_LOCATIONS,
} from "@/features/shared/constants"
import { ELECTRONIC_ITEM_TYPES } from "@/features/shared/itemCategoryRules"

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
  isHighValue?: boolean
  claimProfile?: {
    electronicItemType?: string | null
  } | null
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
  const [electronicItemType, setElectronicItemType] = useState(item.claimProfile?.electronicItemType ?? "")
  const [color, setColor] = useState(item.color)
  const [foundLocation, setFoundLocation] = useState(item.foundLocation)
  const [foundAtLocal, setFoundAtLocal] = useState(() => toLocalDatetimeInputValue(new Date(item.foundAtUtc)))
  const [storageLocation, setStorageLocation] = useState(item.storage)
  const [status, setStatus] = useState(item.status)
  const [privateDiscoveryNote, setPrivateDiscoveryNote] = useState(item.privateDiscoveryNote ?? "")
  const [isHighValue, setIsHighValue] = useState(item.isHighValue ?? false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isElectronics = category === "Electronics"
  const isLocked = item.status === "CLAIM_PENDING" || item.status === "RETURNED"

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault()
    
    const foundAtDate = new Date(foundAtLocal)
    if (Number.isNaN(foundAtDate.getTime())) {
      setError("Invalid found date/time")
      return
    }
    if (isElectronics && !electronicItemType) {
      setError("Please select the electronics type.")
      return
    }
    
    setShowSaveConfirm(true)
  }

  async function executeSubmit(): Promise<void> {
    setIsSubmitting(true)

    try {
      const foundAtDate = new Date(foundAtLocal)

      await api.patch(`/items/${item.id}`, {
        title,
        category,
        color,
        foundLocation,
        foundAtUtc: foundAtDate.toISOString(),
        storageLocation,
        status,
        privateDiscoveryNote: privateDiscoveryNote || undefined,
        isHighValue,
        claimProfile: isElectronics ? { electronicItemType } : null,
      })

      onSaved?.()
      onClose()
    } catch (err) {
      const message = err instanceof AxiosError
        ? (err.response?.data as { message?: string } | undefined)?.message
        : err instanceof Error
          ? err.message
        : undefined
      setError(message ?? "Failed to update item.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(): Promise<void> {
    setError(null)
    setIsDeleting(true)

    try {
      await api.delete(`/items/${item.id}`)
      onSaved?.()
      onClose()
    } catch (err) {
      const message = err instanceof AxiosError
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined
      setError(message ?? "Failed to delete item.")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <ModalHeader
        title="Edit Inventory Item"
        subtitle={item.code}
        icon={<Save className="w-5 h-5 text-white" />}
        onClose={onClose}
      />

      {isLocked && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Editing Prohibited</h3>
            <p className="text-xs font-medium text-amber-700 mt-1">
              This item is currently {item.status === "CLAIM_PENDING" ? "pending handover" : "returned"}. Editing is disabled to preserve record integrity.
            </p>
          </div>
        </div>
      )}

      <form id="edit-item-form" onSubmit={(event) => void handleSubmit(event)} className="flex-1 overflow-y-auto p-6">
        <fieldset disabled={isLocked} className="space-y-8 group">
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
              <Select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (e.target.value !== "Electronics") setElectronicItemType("")
                }}
                className="h-11 bg-slate-50/50 border-slate-200"
                required
              >
                {ITEM_CATEGORIES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
            {isElectronics && (
              <div className="space-y-1.5">
                <Label htmlFor="electronicItemType" className="text-xs uppercase tracking-wider font-bold text-slate-500">Electronics Type</Label>
                <Select
                  id="electronicItemType"
                  value={electronicItemType}
                  onChange={(e) => setElectronicItemType(e.target.value)}
                  className="h-11 bg-slate-50/50 border-slate-200"
                  required
                >
                  <option value="">Select Electronics Type</option>
                  {ELECTRONIC_ITEM_TYPES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="color" className="text-xs uppercase tracking-wider font-bold text-slate-500">Primary Color (Optional)</Label>
              <Select id="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 bg-slate-50/50 border-slate-200">
                <option value="">Not Specified</option>
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
             <ShieldAlert className="w-3.5 h-3.5 text-brand" />
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Security & Visibility</h4>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div className="space-y-1">
              <Label htmlFor="isHighValue" className="font-bold text-slate-700">Mark as High Value Item</Label>
              <p className="text-xs text-slate-500 font-medium">
                Hides the physical proof photo from the public gallery and applies a "SECURED" badge to prevent false claims.
              </p>
            </div>
            <Switch
              id="isHighValue"
              checked={isHighValue}
              onCheckedChange={setIsHighValue}
            />
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
              className="min-h-25 bg-slate-50 border-slate-200 shadow-sm text-slate-600"
            />
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        </fieldset>
      </form>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isSubmitting || isDeleting || isLocked}
          className="h-12 px-4 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent font-bold uppercase tracking-widest text-xs">
          Cancel
        </Button>
        <Button type="submit" form="edit-item-form" disabled={isSubmitting || isLocked} className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold uppercase tracking-widest text-xs shadow-sm rounded-xl transition-all active:scale-95 disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <ConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => !isSubmitting && setShowSaveConfirm(false)}
        onConfirm={() => {
          setShowSaveConfirm(false)
          void executeSubmit()
        }}
        title="Save Changes"
        message="Are you sure you want to save these changes to the inventory item? This will update the system records."
        confirmText="Save Changes"
        cancelText="Cancel"
        isLoading={isSubmitting}
        confirmButtonClassName="bg-brand hover:bg-brand-active rounded-xl"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        onConfirm={() => void handleDelete()}
        title="Delete Item"
        message="Delete this item from inventory? If it has claim, report, or handover history, it will be archived instead so records stay intact."
        confirmText="Delete Item"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  )
}

function toLocalDatetimeInputValue(date: Date): string {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

