import React, { useState, useRef } from "react"
import { Package, Laptop, Wallet, FileText, CheckCircle2, Loader2, Upload, ShieldCheck, AlertCircle, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { useAuth } from "@/contexts/AuthContext"
import { ReportConfirmationModal } from "./ReportConfirmationModal"
import { api } from "@/lib/api"
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES, ITEM_COLORS } from "@/features/admin/itemFormOptions"
import {
  getClaimFieldGroup,
  requiresColorSelection,
} from "@/features/shared/itemCategoryRules"

export function ReportLostForm() {
  const { user } = useAuth()
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const needsColor = requiresColorSelection(category)
  const fieldGroup = category ? getClaimFieldGroup(category) : null
  const [categoryProofValues, setCategoryProofValues] = useState<Record<string, string>>({})
  
  // Form State
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    color: "",
    brand: "",
    location: "",
    date: "",
    time: "",
    // Category specific
    deviceName: "",
    nameOnDoc: "",
    contents: "",
    // Proof
    marks: "",
    privateNote: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const missingRequired = fieldGroup?.fields.find((field) => field.required && !(categoryProofValues[field.key] ?? "").trim())
    if (missingRequired) {
      setError(`Please complete: ${missingRequired.label}`)
      setIsSubmitting(false)
      return
    }

    try {
      const proofData: Record<string, string> = {
        categoryGroup: fieldGroup?.heading ?? "General",
        ...categoryProofValues,
        marks: formData.marks,
        privateNote: formData.privateNote,
        additionalNotes: formData.privateNote,
      }

      await api.post("/reports", {
        title: formData.itemName.trim(),
        category: formData.category,
        color: needsColor ? formData.color : "Not Specified",
        location: formData.location,
        reportedLostAtUtc: new Date(`${formData.date || new Date().toISOString().slice(0, 10)}T00:00:00.000Z`).toISOString(),
        timeWindow: formData.time,
        proofData,
      })

      setShowConfirmation(true)
    } catch {
      setError("Failed to submit report. Please review required fields and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setCategoryProofValues({})
    setFormData((prev) => ({
      ...prev,
      category: value,
      color: requiresColorSelection(value) ? prev.color : "",
    }))
  }

  const handleCategoryProofChange = (key: string, value: string) => {
    setCategoryProofValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={{ marginBottom: '3rem' }}>
        {/* Form Header */}
        <div style={{ backgroundColor: '#1E2F85', padding: '2rem', color: '#FFFFFF', borderRadius: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <FileText style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', margin: 0 }}>Report a Lost or Missing Item</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', margin: 0 }}>Institutionally verified recovery process.</p>
            </div>
          </div>
          
          {/* Session Info Bar */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ width: '0.875rem', height: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Logged in as:</span>
              <span style={{ fontWeight: '600' }}>{user?.name}</span>
            </div>
            <div style={{ width: '1px', height: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Student ID:</span>
              <span style={{ fontWeight: '600' }}>{user?.studentId}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Section 1: Item Identity */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
              <Package style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
              <h3 style={{ fontWeight: 'bold', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', margin: 0 }}>Section 1: Item Identity</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  required
                  placeholder="e.g. Steam Card, Black JBL Earbuds Case"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label htmlFor="category">Category</Label>
                <Select 
                  id="category" 
                  name="category" 
                  required
                  style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}
                  value={category} 
                  onChange={(e) => {
                    handleCategoryChange(e.target.value)
                  }}
                >
                  <option value="">Select a category</option>
                  {ITEM_CATEGORIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>

              {needsColor ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Label htmlFor="color">Primary Color</Label>
                  <Select id="color" name="color" required={needsColor} value={formData.color} onChange={handleInputChange} style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}>
                    <option value="">Select color</option>
                    {ITEM_COLORS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Label>Primary Color</Label>
                  <div style={{ height: '2.5rem', padding: '0 0.75rem', borderRadius: '0.375rem', border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#64748B', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    Not required for this category
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label htmlFor="location">Campus Location</Label>
                <Select id="location" name="location" required value={formData.location} onChange={handleInputChange} style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}>
                  <option value="">Select building/zone</option>
                  {CAMPUS_LOCATIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label htmlFor="date">Date Lost</Label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'rgba(30, 47, 133, 0.6)', pointerEvents: 'none', zIndex: 10 }} />
                  <Input 
                    type="date" 
                    id="date" 
                    name="date" 
                    required 
                    style={{ paddingLeft: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }} 
                    value={formData.date} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label htmlFor="time">Time Window</Label>
                <div style={{ position: 'relative' }}>
                  <Clock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'rgba(30, 47, 133, 0.6)', pointerEvents: 'none', zIndex: 10 }} />
                  <Select 
                    id="time" 
                    name="time" 
                    required 
                    style={{ paddingLeft: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}
                    value={formData.time} 
                    onChange={handleInputChange}
                  >
                    <option value="">Select window</option>
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 9PM)</option>
                    <option value="night">Late Night (9PM - 6AM)</option>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Conditional Verification Data */}
          {fieldGroup && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                {category.toLowerCase().includes("electronics") && <Laptop style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />}
                {(category.toLowerCase().includes("bag") || category.toLowerCase().includes("wallet") || category.toLowerCase().includes("id")) && <Wallet style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />}
                {category.toLowerCase().includes("document") && <FileText style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />}
                <h3 style={{ fontWeight: 'bold', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', margin: 0 }}>
                  Section 2: Category Verification
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {fieldGroup.fields.map((field) => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span style={{ color: '#E11D48', marginLeft: '0.25rem' }}>*</span>}
                    </Label>

                    {field.type === "text" && (
                      <Input
                        id={field.key}
                        value={categoryProofValues[field.key] ?? ""}
                        onChange={(event) => handleCategoryProofChange(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}
                      />
                    )}

                    {field.type === "select" && (
                      <Select
                        id={field.key}
                        value={categoryProofValues[field.key] ?? ""}
                        onChange={(event) => handleCategoryProofChange(field.key, event.target.value)}
                        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}
                      >
                        <option value="">Select an option</option>
                        {(field.options ?? []).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </Select>
                    )}

                    {field.type === "textarea" && (
                      <Textarea
                        id={field.key}
                        value={categoryProofValues[field.key] ?? ""}
                        onChange={(event) => handleCategoryProofChange(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}
                      />
                    )}

                    {field.prompt && <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>{field.prompt}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Proof & Verification */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
              <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
              <h3 style={{ fontWeight: 'bold', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', margin: 0 }}>Section 3: Proof & Verification</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Photo Upload Placeholder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Label>Reference Photo (Optional)</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: '2px dashed #E2E8F0', 
                    backgroundColor: '#FFFFFF', 
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                    borderRadius: '1rem', 
                    padding: '2rem', 
                    cursor: 'pointer', 
                    textAlign: 'center' 
                  }}
                >
                  <input type="file" style={{ display: 'none' }} ref={fileInputRef} accept="image/*" multiple />
                  <div style={{ width: '3rem', height: '3rem', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem transition-colors' }}>
                    <Upload style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
                  </div>
                  <h4 style={{ fontWeight: 'bold', color: '#334155', margin: 0 }}>Click or drag to upload</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', margin: 0 }}>Max 2 files • 5MB Limit per file</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label htmlFor="marks">Distinguishing Marks</Label>
                <Textarea 
                  id="marks" 
                  name="marks" 
                  placeholder="List unique scratches, stickers, charms or personalized features..." 
                  value={formData.marks}
                  onChange={handleInputChange}
                  style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Label htmlFor="privateNote" style={{ color: '#1E2F85' }}>Additional Notes (Only for Admin Review)</Label>
                  <AlertCircle style={{ width: '0.75rem', height: '0.75rem', color: 'rgba(30, 47, 133, 0.6)' }} />
                </div>
                <Input 
                  id="privateNote" 
                  name="privateNote" 
                  placeholder="Add any extra details that can help verification." 
                  value={formData.privateNote}
                  onChange={handleInputChange}
                  style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid rgba(30, 47, 133, 0.2)' }} 
                />
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>This field is encrypted and visible only to the reviewing Administrator.</p>
              </div>
            </div>
          </section>

          {/* Submit UI */}
          <div style={{ paddingTop: '2rem', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ backgroundColor: 'rgba(30, 47, 133, 0.03)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid rgba(30, 47, 133, 0.1)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <div style={{ width: '2rem', height: '2rem', backgroundColor: '#FFFFFF', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid rgba(30, 47, 133, 0.2)' }}>
                <ShieldCheck style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: '1.5', fontWeight: '500', margin: 0 }}>
                Your report will be manually reviewed by the Campus Admin Office to ensure a secure return process. Reports remain private and will not appear in the public gallery.
              </p>
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              style={{ width: '100%', height: '3.5rem', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1E2F85', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                  Processing Report...
                </span>
              ) : (
                "Submit Official Report"
              )}
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <span style={{ width: '0.375rem', height: '0.375rem', backgroundColor: '#CBD5E1', borderRadius: '50%' }} />
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Protocol: Direct Admin Submission</p>
            </div>
          </div>

          {error && <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#E11D48', margin: 0 }}>{error}</p>}
        </div>
      </form>

      <ReportConfirmationModal 
        isOpen={showConfirmation} 
        onClose={() => setShowConfirmation(false)} 
      />
    </>
  )
}

