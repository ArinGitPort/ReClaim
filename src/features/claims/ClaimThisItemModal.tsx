import { X, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { ITEM_COLORS } from "@/features/admin/itemFormOptions"

interface ClaimThisItemModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
  itemCategory: string
}

type DynamicFieldConfig = {
  key: string
  label: string
  type: "text" | "select" | "textarea"
  required: boolean
  placeholder?: string
  prompt?: string
  options?: string[]
}

type DynamicFieldGroup = {
  heading: string
  fields: DynamicFieldConfig[]
}

export function ClaimThisItemModal({ isOpen, onClose, itemId, itemTitle, itemCategory }: ClaimThisItemModalProps) {
  const [proofValues, setProofValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fieldGroup = getDynamicFieldGroup(itemCategory)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setError(null)
      setProofValues({})
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleFieldChange(key: string, value: string): void {
    setProofValues((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  async function handleSubmitClaim(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)

    const missingRequired = fieldGroup.fields.find((field) => field.required && !(proofValues[field.key] ?? "").trim())
    if (missingRequired) {
      setError(`Please complete: ${missingRequired.label}`)
      return
    }

    setIsSubmitting(true)
    try {
      await api.post("/claims", {
        foundItemId: itemId,
        proof: {
          categoryGroup: fieldGroup.heading,
          ...proofValues,
        },
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4">
      <div
        className="fixed inset-0 bg-slate-900/80"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200" data-item-id={itemId}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">Claim This Item</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="claim-this-item-form" onSubmit={(event) => void handleSubmitClaim(event)} className="p-8 space-y-8">
          <div className="bg-brand/[0.03] border border-brand/10 rounded-xl p-5 flex gap-4 text-slate-600">
            <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <p className="text-[13px] leading-relaxed font-medium">
              For security, we keep identifying details hidden. To claim this <span className="text-slate-900 font-bold">{itemTitle}</span>, please describe any specific marks, engravings, or hidden features.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{fieldGroup.heading}</h3>

              {fieldGroup.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    {field.label}
                    {field.required ? <span className="text-rose-500 font-black">*</span> : <span className="text-slate-400 font-medium">(Optional)</span>}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={proofValues[field.key] ?? ""}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                      className="w-full h-12 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      value={proofValues[field.key] ?? ""}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                      className="w-full h-12 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all text-slate-900 cursor-pointer font-medium"
                    >
                      <option value="" disabled>Select an option</option>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder}
                      value={proofValues[field.key] ?? ""}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                      className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all text-slate-900 resize-none placeholder:text-slate-400 font-medium shadow-inner"
                    />
                  )}

                  {field.prompt && <p className="text-[11px] text-slate-500">{field.prompt}</p>}
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="claim-this-item-form"
            disabled={isSubmitting}
            className="flex-1 h-12 bg-brand hover:bg-brand-active transition-all text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 shadow-sm uppercase tracking-widest"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>

      </div>
    </div>
  )
}

function getDynamicFieldGroup(category: string): DynamicFieldGroup {
  const normalized = category.trim().toLowerCase()

  if (normalized.includes("electronics")) {
    return {
      heading: "Group A: Electronics & Tech",
      fields: [
        {
          key: "deviceNameOrUsername",
          label: "Device Name / Username",
          type: "text",
          required: true,
          placeholder: "e.g., John-iphone-15",
        },
        {
          key: "lockScreenWallpaper",
          label: "Lock Screen Wallpaper",
          type: "text",
          required: true,
          placeholder: "Describe the lock screen image",
        },
        {
          key: "externalCaseOrColor",
          label: "External Case / Color",
          type: "select",
          required: true,
          options: [...ITEM_COLORS],
        },
        {
          key: "serialNumberOrMacAddress",
          label: "Serial Number / MAC Address",
          type: "text",
          required: false,
          placeholder: "Optional",
        },
      ],
    }
  }

  if (normalized.includes("bags") || normalized.includes("wallet") || normalized.includes("document")) {
    return {
      heading: "Group B: Bags, Wallets & Containers",
      fields: [
        {
          key: "brandOrMake",
          label: "Brand / Make",
          type: "text",
          required: true,
          placeholder: "e.g., Jansport",
        },
        {
          key: "externalColorOrPattern",
          label: "External Color/Pattern",
          type: "select",
          required: true,
          options: [...ITEM_COLORS],
        },
        {
          key: "specificInternalContents",
          label: "Specific Internal Contents",
          type: "textarea",
          required: true,
          placeholder: "List specific IDs, cards, or exact items inside.",
          prompt: "List specific IDs, cards, or exact items inside.",
        },
      ],
    }
  }

  if (normalized.includes("jewelry") || normalized.includes("accessories")) {
    return {
      heading: "Group C: Jewelry & Accessories",
      fields: [
        {
          key: "materialOrColor",
          label: "Material / Color",
          type: "select",
          required: true,
          options: ["Gold", "Silver", "Leather", "Rose Gold", "Black", "Multi-color"],
        },
        {
          key: "engravingsOrInscriptions",
          label: "Engravings / Inscriptions",
          type: "text",
          required: false,
          placeholder: "Optional",
        },
        {
          key: "distinctiveDamageOrFeatures",
          label: "Distinctive Damage / Features",
          type: "textarea",
          required: true,
          placeholder: "e.g., Missing stones, scratched face, specific clasp.",
          prompt: "e.g., Missing stones, scratched face, specific clasp.",
        },
      ],
    }
  }

  return {
    heading: "Group D: Everyday Items",
    fields: [
      {
        key: "brandOrIdentifyingText",
        label: "Brand or Identifying Text",
        type: "text",
        required: true,
        placeholder: "e.g., HydroFlask or Property of Juan",
      },
      {
        key: "distinctiveFeaturesAndCondition",
        label: "Distinctive Features & Condition",
        type: "textarea",
        required: true,
        placeholder: "Describe specific scratches, stickers, torn pages, or stains.",
        prompt: "Describe specific scratches, stickers, torn pages, or stains.",
      },
    ],
  }
}
