import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { X, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { api } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"
import { getClaimFieldGroup } from "@/features/shared/itemCategoryRules"

interface ClaimThisItemModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
  itemCategory: string
  itemImageUrl?: string
  cooldownAvailableAt?: string
}

export function ClaimThisItemModal({ isOpen, onClose, itemId, itemTitle, itemCategory, itemImageUrl, cooldownAvailableAt }: ClaimThisItemModalProps) {
  const [proofValues, setProofValues] = useState<Record<string, string>>({})
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  const fieldGroup = getClaimFieldGroup(itemCategory)
  const isCooldownActive = Boolean(cooldownAvailableAt && new Date(cooldownAvailableAt).getTime() > Date.now())

  useEffect(() => {
    if (isOpen) {
      setProofValues({})
      setAdditionalNotes("")
      setError(null)
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

    if (isCooldownActive && cooldownAvailableAt) {
      setError(`You can claim this item again after ${formatFriendlyDateTime(cooldownAvailableAt)}.`)
      return
    }

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
          ...(additionalNotes.trim() ? { additionalNotes: additionalNotes.trim() } : {}),
        },
      })
      onClose()
    } catch (err) {
      const userMessage = typeof err === "object" && err && "userMessage" in err
        ? (err as { userMessage?: unknown }).userMessage
        : undefined
      const availableAt = typeof err === "object" && err && "response" in err
        ? (err as { response?: { data?: { details?: { availableAt?: unknown } } } }).response?.data?.details?.availableAt
        : undefined
      const message = typeof userMessage === "string"
        ? formatClaimErrorMessage(userMessage, availableAt)
        : "Unable to submit this claim. The item may already be reserved."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fullImageUrl = getImageUrl(itemImageUrl) ?? null

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        <ModalHeader
          title="Claim This Item"
          icon={<ShieldCheck className="w-5 h-5 text-brand" />}
          onClose={onClose}
          containerClassName="bg-slate-50/30"
          iconWrapperClassName="bg-brand/10"
          titleClassName="text-slate-900"
        />

        <form id="claim-this-item-form" onSubmit={(event) => void handleSubmitClaim(event)} className="p-8 space-y-8">
          {fullImageUrl && (
            <div className="w-full h-48 sm:h-64 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setIsImageExpanded(true)}>
              <img src={fullImageUrl} alt={itemTitle} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          )}

          <div className="bg-brand/3 border border-brand/10 rounded-xl p-5 flex gap-4 text-slate-600">
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

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Additional Notes <span className="text-slate-400 font-medium">(Optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Add any extra details that can help verification."
                  value={additionalNotes}
                  onChange={(event) => setAdditionalNotes(event.target.value)}
                  className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all text-slate-900 resize-none placeholder:text-slate-400 font-medium shadow-inner"
                />
              </div>
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          {isCooldownActive && cooldownAvailableAt && !error && (
            <p className="text-sm font-semibold text-rose-600">
              You can claim this item again after {formatFriendlyDateTime(cooldownAvailableAt)}.
            </p>
          )}
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
            disabled={isSubmitting || isCooldownActive}
            className="flex-1 h-12 bg-brand hover:bg-brand-active transition-all text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 shadow-sm uppercase tracking-widest"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>

    </Modal>

      {isImageExpanded && fullImageUrl && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsImageExpanded(false)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setIsImageExpanded(false)
            }}
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <img 
            src={fullImageUrl} 
            alt={itemTitle} 
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}

function formatClaimErrorMessage(message: string, availableAt: unknown): string {
  if (typeof availableAt === "string") {
    return `You can claim this item again after ${formatFriendlyDateTime(availableAt)}.`
  }

  return message
}

function formatFriendlyDateTime(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
