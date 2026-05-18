import React, { useState, useRef } from "react"
import { Package, Laptop, Wallet, FileText, CheckCircle2, Loader2, Upload, ShieldCheck, AlertCircle, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { useAuth } from "@/contexts/AuthContext"
import { ReportConfirmationModal } from "./ReportConfirmationModal"
import { api } from "@/lib/api"
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES, ITEM_COLORS } from "@/features/shared/constants"
import { MAX_REPORT_EVIDENCE_FILES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants"
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const needsColor = requiresColorSelection(category)
  const [categoryProofValues, setCategoryProofValues] = useState<Record<string, string>>({})

  const maxFiles = MAX_REPORT_EVIDENCE_FILES
  const maxFileSize = MAX_UPLOAD_SIZE_BYTES
  const allowedFileTypes = new Set(["image/jpeg", "image/png", "image/webp"])
  
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
  const fieldGroup = category ? getClaimFieldGroup(category, { collectElectronicItemType: true }) : null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateFiles = (files: File[]): string | null => {
    if (files.length > maxFiles) {
      return `Upload up to ${maxFiles} files only.`
    }

    if (files.some((file) => !allowedFileTypes.has(file.type))) {
      return "Only JPG, PNG, and WEBP images are allowed."
    }

    if (files.some((file) => file.size > maxFileSize)) {
      return "Each file must be 5MB or smaller."
    }

    return null
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      setSelectedFiles([])
      return
    }

    const validationError = validateFiles(files)
    if (validationError) {
      setError(validationError)
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setError(null)
    setSelectedFiles(files)
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
      let evidenceUrls: string[] = []

      if (selectedFiles.length > 0) {
        const validationError = validateFiles(selectedFiles)
        if (validationError) {
          setError(validationError)
          setIsSubmitting(false)
          return
        }

        const payload = new FormData()
        selectedFiles.forEach((file) => {
          payload.append("evidence", file)
        })

        try {
          const uploadResponse = await api.post<{ evidenceUrls: string[] }>("/reports/upload-evidence", payload, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          evidenceUrls = uploadResponse.data.evidenceUrls
        } catch {
          setError("Failed to upload evidence images. Please try again.")
          setIsSubmitting(false)
          return
        }
      }

      const proofData: Record<string, unknown> = {
        categoryGroup: fieldGroup?.heading ?? "General",
        ...categoryProofValues,
        marks: formData.marks,
        privateNote: formData.privateNote,
        additionalNotes: formData.privateNote,
      }

      if (evidenceUrls.length > 0) {
        proofData.attachments = evidenceUrls
      }

      await api.post("/reports", {
        title: formData.itemName.trim(),
        category: formData.category,
        color: formData.color || "Not Specified",
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

  const clearSelectedFiles = () => {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-12">
        {/* Form Header */}
        <div className="bg-brand p-5 sm:p-8 text-white rounded-2xl shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Report a Lost or Missing Item</h1>
              <p className="text-white/70 text-sm">Institutionally verified recovery process.</p>
            </div>
          </div>
          
          {/* Session Info Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 px-4 bg-black/10 rounded-lg border border-white/5 text-[12px]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/80 uppercase font-bold tracking-wider">Logged in as:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-white/80 uppercase font-bold tracking-wider">Student ID:</span>
              <span className="font-semibold">{user?.studentId}</span>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Section 1: Item Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-brand" />
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Section 1: Item Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  required
                  placeholder="e.g. Steam Card, Black JBL Earbuds Case"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  className="bg-white shadow-sm border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  id="category" 
                  name="category" 
                  required
                  className="bg-white shadow-sm border-slate-200"
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
                <div className="space-y-2">
                  <Label htmlFor="color">Primary Color (Optional)</Label>
                  <Select id="color" name="color" value={formData.color} onChange={handleInputChange} className="bg-white shadow-sm border-slate-200">
                    <option value="">Not Specified</option>
                    {ITEM_COLORS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="h-10 px-3 rounded-md border border-slate-200 bg-slate-100 text-slate-500 text-sm font-semibold flex items-center">
                    Not required for this category
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">Campus Location</Label>
                <Select id="location" name="location" required value={formData.location} onChange={handleInputChange} className="bg-white shadow-sm border-slate-200">
                  <option value="">Select building/zone</option>
                  {CAMPUS_LOCATIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date Lost</Label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60 group-hover:text-brand transition-colors pointer-events-none z-30" />
                  <Input 
                    type="date" 
                    id="date" 
                    name="date" 
                    required 
                    className="pl-10 custom-date-input relative z-20 bg-white shadow-sm border-slate-200" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time Window</Label>
                <div className="relative group">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/60 group-hover:text-brand transition-colors pointer-events-none z-30" />
                  <Select 
                    id="time" 
                    name="time" 
                    required 
                    className="pl-10 bg-white shadow-sm border-slate-200"
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
            <section className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                {category.toLowerCase().includes("electronics") && <Laptop className="w-4 h-4 text-brand" />}
                {(category.toLowerCase().includes("bag") || category.toLowerCase().includes("wallet") || category.toLowerCase().includes("id")) && <Wallet className="w-4 h-4 text-brand" />}
                {category.toLowerCase().includes("document") && <FileText className="w-4 h-4 text-brand" />}
                <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">
                  Section 2: Category Verification
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {fieldGroup.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </Label>

                    {field.type === "text" && (
                      <Input
                        id={field.key}
                        value={categoryProofValues[field.key] ?? ""}
                        onChange={(event) => handleCategoryProofChange(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        className="bg-white shadow-sm border-slate-200"
                      />
                    )}

                    {field.type === "select" && (
                      <Select
                        id={field.key}
                        value={categoryProofValues[field.key] ?? ""}
                        onChange={(event) => handleCategoryProofChange(field.key, event.target.value)}
                        className="bg-white shadow-sm border-slate-200"
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
                        className="bg-white shadow-sm border-slate-200"
                      />
                    )}

                    {field.prompt && <p className="text-[11px] text-slate-500">{field.prompt}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Proof & Verification */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-brand" />
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Section 3: Proof & Verification</h3>
            </div>
            
            <div className="space-y-8">
              {/* Photo Upload Placeholder */}
              <div className="space-y-3">
                <Label>Reference Photo (Optional)</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group border-2 border-dashed border-slate-200 bg-white shadow-sm rounded-2xl p-6 sm:p-8 hover:border-brand hover:bg-brand/2 transition-all cursor-pointer text-center"
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand" />
                  </div>
                  <h4 className="font-bold text-slate-700">Click or drag to upload</h4>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Max 2 files • 5MB Limit per file</p>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Selected files ({selectedFiles.length})</span>
                      <button type="button" onClick={clearSelectedFiles} className="text-[10px] font-bold uppercase tracking-widest text-brand">
                        Clear
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {selectedFiles.map((file) => (
                        <li key={file.name} className="flex items-center justify-between gap-2">
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400">{Math.ceil(file.size / 1024)} KB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks">Distinguishing Marks</Label>
                <Textarea 
                  id="marks" 
                  name="marks" 
                  placeholder="List unique scratches, stickers, charms or personalized features..." 
                  value={formData.marks}
                  onChange={handleInputChange}
                  className="bg-white shadow-sm border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="privateNote" className="text-brand">Additional Notes (Only for Admin Review)</Label>
                  <AlertCircle className="w-3 h-3 text-brand/60" />
                </div>
                <Input 
                  id="privateNote" 
                  name="privateNote" 
                  placeholder="Add any extra details that can help verification." 
                  value={formData.privateNote}
                  onChange={handleInputChange}
                  className="bg-white shadow-sm border-brand/20 focus:border-brand ring-brand/5" 
                />
                <p className="text-[11px] text-slate-400">This field is encrypted and visible only to the reviewing Administrator.</p>
              </div>
            </div>
          </section>

          {/* Submit UI */}
          <div className="pt-8 border-t border-slate-200">
            <div className="bg-brand/3 rounded-xl p-5 border border-brand/10 mb-6 flex gap-4 shadow-sm">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-brand/20">
                <ShieldCheck className="w-4 h-4 text-brand" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Your report will be manually reviewed by the Campus Admin Office to ensure a secure return process. Reports remain private and will not appear in the public gallery.
              </p>
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md bg-brand hover:bg-brand/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Report...
                </span>
              ) : (
                "Submit Official Report"
              )}
            </Button>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Protocol: Direct Admin Submission</p>
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        </div>
      </form>

      <ReportConfirmationModal 
        isOpen={showConfirmation} 
        onClose={() => setShowConfirmation(false)} 
      />
    </>
  )
}

