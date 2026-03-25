import { X, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { getClaimFieldGroup } from "@/features/shared/itemCategoryRules"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"

const modalOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'center',
  overflowY: 'auto',
  padding: '2.5rem 1rem',
}

const modalBackdropStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
}

const modalContentStyles: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '32rem',
  backgroundColor: '#FFFFFF',
  borderRadius: '0.75rem',
  border: '1px solid #E2E8F0',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
  margin: 'auto',
}

const modalHeaderStyles: React.CSSProperties = {
  padding: '1.5rem',
  borderBottom: '1px solid #F1F5F9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(248, 250, 252, 0.5)',
}

const headerIconWrapperStyles: React.CSSProperties = {
  width: '2.5rem',
  height: '2.5rem',
  backgroundColor: 'rgba(30, 47, 133, 0.1)',
  borderRadius: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
}

const headerTitleStyles: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 800,
  color: '#0F172A',
  textTransform: 'uppercase',
  letterSpacing: '-0.025em',
  margin: 0,
}

const footerStyles: React.CSSProperties = {
  padding: '1.5rem',
  borderTop: '1px solid #F1F5F9',
  backgroundColor: 'rgba(248, 250, 252, 0.5)',
  display: 'flex',
  gap: '0.75rem',
}

const noticeBannerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  padding: '1.25rem',
  backgroundColor: 'rgba(30, 47, 133, 0.03)',
  borderRadius: '0.75rem',
  border: '1px solid rgba(30, 47, 133, 0.1)',
  color: '#475569',
}

const sectionTitleStyles: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: '#94A3B8',
  marginLeft: '0.25rem',
}

interface ClaimThisItemModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
  itemCategory: string
}

export function ClaimThisItemModal({ isOpen, onClose, itemId, itemTitle, itemCategory }: ClaimThisItemModalProps) {
  const [proofValues, setProofValues] = useState<Record<string, string>>({})
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fieldGroup = getClaimFieldGroup(itemCategory)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setError(null)
      setProofValues({})
      setAdditionalNotes("")
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
          ...(additionalNotes.trim() ? { additionalNotes: additionalNotes.trim() } : {}),
        },
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={modalOverlayStyles}>
      <div style={modalBackdropStyles} onClick={onClose} />

      <div style={modalContentStyles} data-item-id={itemId}>
        <div style={modalHeaderStyles}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={headerIconWrapperStyles}>
              <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: '#1E2F85' }} />
            </div>
            <div>
              <h2 style={headerTitleStyles}>Claim This Item</h2>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '0.5rem', color: '#94A3B8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '9999px' }}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        <form id="claim-this-item-form" onSubmit={(event) => void handleSubmitClaim(event)} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={noticeBannerStyles}>
            <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: '#1E2F85', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', lineHeight: '1.6', fontWeight: 500, margin: 0 }}>
              For security, we keep identifying details hidden. To claim this <span style={{ color: '#0F172A', fontWeight: 800 }}>{itemTitle}</span>, please describe any specific marks, engravings, or hidden features.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={sectionTitleStyles}>{fieldGroup.heading}</h3>

            {fieldGroup.fields.map((field) => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700 }}>
                  {field.label}
                  {field.required ? (
                    <span style={{ color: '#E11D48', fontWeight: 900 }}>*</span>
                  ) : (
                    <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '12px' }}>(Optional)</span>
                  )}
                </Label>

                {field.type === "text" && (
                  <Input
                    type="text"
                    placeholder={field.placeholder}
                    value={proofValues[field.key] ?? ""}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    style={{ backgroundColor: '#F8FAFC' }}
                  />
                )}

                {field.type === "select" && (
                   <Select
                    value={proofValues[field.key] ?? ""}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    style={{ backgroundColor: '#F8FAFC' }}
                   >
                     <option value="" disabled>Select an option</option>
                     {(field.options ?? []).map((option) => (
                       <option key={option} value={option}>{option}</option>
                     ))}
                   </Select>
                )}

                {field.type === "textarea" && (
                  <Textarea
                    placeholder={field.placeholder}
                    value={proofValues[field.key] ?? ""}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    style={{ minHeight: '100px', backgroundColor: '#F8FAFC' }}
                  />
                )}

                {field.prompt && <p style={{ fontSize: '11px', color: '#64748B', margin: '0.25rem 0 0' }}>{field.prompt}</p>}
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Label style={{ fontWeight: 700 }}>
                Additional Notes <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '12px' }}>(Optional)</span>
              </Label>
              <Textarea
                placeholder="Add any extra details that can help verification."
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
                style={{ minHeight: '100px', backgroundColor: '#F8FAFC' }}
              />
            </div>
          </div>
          {error && <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#E11D48', margin: 0 }}>{error}</p>}
        </form>

        <div style={footerStyles}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            style={{ flex: 1, height: '3rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="claim-this-item-form"
            disabled={isSubmitting}
            style={{ flex: 1, height: '3rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: '#1E2F85' }}
          >
            <CheckCircle2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  )
}
