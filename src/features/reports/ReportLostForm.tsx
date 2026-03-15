import React, { useState, useRef } from "react"
import { Package, Laptop, Wallet, FileText, CheckCircle2, Loader2, Upload, ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { useAuth } from "@/features/auth/AuthContext"
import { ReportConfirmationModal } from "./ReportConfirmationModal"

type Category = "electronics" | "bags" | "wallets" | "clothing" | "keys" | "others" | ""

export function ReportLostForm() {
  const { user } = useAuth()
  const [category, setCategory] = useState<Category>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form State
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowConfirmation(true)
    }, 2000)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-12">
        {/* Form Header */}
        <div className="bg-[#1E2F85] p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Post a Missing Item Report</h1>
              <p className="text-indigo-100/70 text-sm">Institutionally verified recovery process.</p>
            </div>
          </div>
          
          {/* Session Info Bar */}
          <div className="mt-6 flex items-center gap-4 py-3 px-4 bg-black/20 rounded-lg border border-white/5 text-[12px]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-indigo-200 uppercase font-bold tracking-wider">Logged in as:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-indigo-200 uppercase font-bold tracking-wider">Student ID:</span>
              <span className="font-semibold">{user?.studentId}</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Section 1: Item Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-brand" />
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Section 1: Item Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  id="category" 
                  name="category" 
                  required
                  value={category} 
                  onChange={(e) => {
                    setCategory(e.target.value as Category)
                    handleInputChange(e)
                  }}
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics (Phone, Laptop, etc.)</option>
                  <option value="bags">Bags & Backpacks</option>
                  <option value="wallets">Wallets/IDs & Documents</option>
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="keys">Keys & Keychains</option>
                  <option value="others">Others</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Primary Color</Label>
                <Select id="color" name="color" required value={formData.color} onChange={handleInputChange}>
                  <option value="">Select color</option>
                  <option value="black">Black</option>
                  <option value="silver">Silver/Gray</option>
                  <option value="white">White</option>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="gold">Gold/Tan</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand / Model (Optional)</Label>
                <Input id="brand" name="brand" placeholder="e.g. Apple, Nike, Sony" value={formData.brand} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Campus Location</Label>
                <Select id="location" name="location" required value={formData.location} onChange={handleInputChange}>
                  <option value="">Select building/zone</option>
                  <option value="lib">Main Library</option>
                  <option value="eng">Engineering Building</option>
                  <option value="caf">Campus Cafeteria</option>
                  <option value="gym">University Gym</option>
                  <option value="park">Central Park</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date Lost</Label>
                <Input type="date" id="date" name="date" required value={formData.date} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time Window</Label>
                <Select id="time" name="time" required value={formData.time} onChange={handleInputChange}>
                  <option value="">Select window</option>
                  <option value="morning">Morning (6AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 9PM)</option>
                  <option value="night">Late Night (9PM - 6AM)</option>
                </Select>
              </div>
            </div>
          </section>

          {/* Section 2: Conditional Verification Data */}
          {category && (category === "electronics" || category === "bags" || category === "wallets") && (
            <section className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                {category === "electronics" && <Laptop className="w-4 h-4 text-brand" />}
                {category === "bags" && <Wallet className="w-4 h-4 text-brand" />}
                {category === "wallets" && <FileText className="w-4 h-4 text-brand" />}
                <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">
                  Section 2: Conditional verification
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {category === "electronics" && (
                  <div className="space-y-2">
                    <Label htmlFor="deviceName">Device Name / Bluetooth Name</Label>
                    <Input id="deviceName" name="deviceName" placeholder="e.g. Mika's iPhone, My Macbook Pro" value={formData.deviceName} onChange={handleInputChange} />
                    <p className="text-[11px] text-slate-500">Helpful for confirming ownership via system settings.</p>
                  </div>
                )}

                {category === "wallets" && (
                  <div className="space-y-2">
                    <Label htmlFor="nameOnDoc">Full Name Printed on the Document</Label>
                    <Input id="nameOnDoc" name="nameOnDoc" placeholder="Enter the exact name shown" value={formData.nameOnDoc} onChange={handleInputChange} />
                    <p className="text-[11px] text-slate-500 italic">This will be cross-referenced with your student record.</p>
                  </div>
                )}

                {category === "bags" && (
                  <div className="space-y-2">
                    <Label htmlFor="contents">Specific Contents (Interior)</Label>
                    <Textarea 
                      id="contents" 
                      name="contents" 
                      placeholder="Describe specific items kept inside (e.g. blue notebook, specific charm, etc.)" 
                      value={formData.contents}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
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
                  className="group border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-brand hover:bg-brand/[0.02] transition-all cursor-pointer text-center"
                >
                  <input type="file" className="hidden" ref={fileInputRef} accept="image/*" multiple />
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand" />
                  </div>
                  <h4 className="font-bold text-slate-700">Click or drag to upload</h4>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Max 2 files • 5MB Limit per file</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks">Distinguishing Marks</Label>
                <Textarea 
                  id="marks" 
                  name="marks" 
                  placeholder="List unique scratches, stickers, charms or personalized features..." 
                  value={formData.marks}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="privateNote" className="text-indigo-600">Personal Private Note (Highly Sensitive Proof)</Label>
                  <AlertCircle className="w-3 h-3 text-indigo-400" />
                </div>
                <Input 
                  id="privateNote" 
                  name="privateNote" 
                  placeholder="e.g. 'The lock screen is a photo of me and my dog'" 
                  value={formData.privateNote}
                  onChange={handleInputChange}
                />
                <p className="text-[11px] text-slate-400 italic">This field is encrypted and visible only to the reviewing Administrator.</p>
              </div>
            </div>
          </section>

          {/* Submit UI */}
          <div className="pt-8 border-t border-slate-200">
            <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 mb-6 flex gap-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs text-indigo-700/80 leading-relaxed">
                Your report will be manually reviewed by the Campus Admin Office to ensure a secure return process. Reports remain private and will not appear in the public gallery.
              </p>
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-brand/20 bg-brand hover:bg-brand/90"
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
        </div>
      </form>

      <ReportConfirmationModal 
        isOpen={showConfirmation} 
        onClose={() => setShowConfirmation(false)} 
      />
    </>
  )
}
