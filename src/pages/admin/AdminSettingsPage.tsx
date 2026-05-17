import { Shield, Map, Bell, Database, Mail, Building, Laptop, Phone, Loader2, CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"

export function SettingsPage() {
  const [isSaved, setIsSaved] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      institutionName: "University of Technology",
      supportEmail: "lostandfound@university.edu",
      phone: "+1 (555) 123-4567"
    }
  })

  const onSubmit = async (_data: any) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Configure campus zones, categories, and staff permissions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Left Column - Navigation / Categories */}
        <div className="xl:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand text-white rounded-xl text-left font-semibold transition-colors">
            <Building className="w-5 h-5" /> General System
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left font-medium transition-colors">
            <Shield className="w-5 h-5" /> Roles & Permissions
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left font-medium transition-colors">
            <Map className="w-5 h-5" /> Campus Zones
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left font-medium transition-colors">
            <Bell className="w-5 h-5" /> Alert Templates
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left font-medium transition-colors mb-4 border-b border-transparent">
            <Database className="w-5 h-5" /> Retention Policy
          </button>
        </div>

        {/* Right Column - Forms */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Institutional Settings Form */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Global Institution Details</h3>
                <p className="text-sm text-slate-500 mt-1">Primary details used across the Lost & Found portal.</p>
              </div>
              {isSaved && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Institution Name</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        {...register("institutionName")}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm font-semibold text-slate-900" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        {...register("supportEmail")}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm font-semibold text-slate-900" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Central Office Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        {...register("phone")}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm font-semibold text-slate-900" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 h-11 px-8 rounded-xl bg-brand text-white text-sm font-bold shadow-sm hover:bg-brand-active transition-colors disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Integration Status placeholder */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">System Integrations</h3>
              <p className="text-sm text-slate-500 mt-1">Connected automated processing services.</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                     <Laptop className="w-5 h-5" />
                   </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Computer Vision AI</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Auto-tagging and sorting engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     Online
                  </span>
                  <button className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

