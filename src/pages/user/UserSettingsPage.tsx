import { User, Bell, Palette, Shield, Mail, Phone, MapPin, BadgeCheck, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useForm } from "react-hook-form"
import { useState } from "react"

export function SettingsPage() {
  const { user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      fullName: user?.name || "Student Name",
      phone: ""
    }
  })

  const onSubmit = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="w-full min-h-full pb-24 bg-slate-50/30">
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account details and application preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0 text-brand">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{user?.name || "Student Name"}</h3>
              <p className="text-slate-500 font-medium">{user?.email || "student@university.edu"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold tracking-widest uppercase">
                <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">Student Account</span>
                <span className="bg-brand/10 text-brand px-3 py-1.5 rounded-lg">Verified Member</span>
              </div>
            </div>
            <button className="hidden sm:inline-flex h-10 px-5 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Edit Profile
            </button>
          </div>
          
          {/* Mobile edit button */}
          <button className="w-full sm:hidden mt-6 h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Column - Navigation / Categories */}
          <div className="md:col-span-1 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand/10 text-brand rounded-xl text-left font-semibold transition-colors">
              <User className="w-5 h-5" /> Account Detail
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left font-medium transition-colors">
              <Bell className="w-5 h-5" /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left font-medium transition-colors">
              <Palette className="w-5 h-5" /> Appearance
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left font-medium transition-colors mb-4 border-b border-transparent">
              <Shield className="w-5 h-5" /> Security
            </button>
          </div>

          {/* Right Column - Forms */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Account Details Form */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-500 mt-1">Update your contact details to ensure we can reach you when items are found.</p>
                </div>
                {isSaved && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in duration-300">
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        {...register("fullName")}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-semibold text-slate-900" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Student ID</label>
                      <div className="relative">
                        <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          readOnly
                          defaultValue={user?.studentId || "Not provided"}
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none text-sm font-semibold" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" 
                          readOnly
                          defaultValue={user?.email || "student@university.edu"}
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none text-sm font-semibold" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="tel" 
                          placeholder="+1 (555) 000-0000"
                          {...register("phone")}
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-semibold text-slate-900" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                       <label className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">Department / Major</label>
                       <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          readOnly
                          defaultValue="Computer Science"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none text-sm font-semibold" 
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

            {/* General Preferences placeholder */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Account Security</h3>
                <p className="text-sm text-slate-500 mt-1">Manage your password and active sessions.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Password</h4>
                    <p className="text-xs text-slate-500 mt-1">Change your login password.</p>
                  </div>
                  <button className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
