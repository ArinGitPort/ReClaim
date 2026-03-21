import { Settings as SettingsIcon, Bell, Shield, Eye, Globe, Moon, Laptop, Sun, Save } from "lucide-react"
import { useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { useAuth } from "@/contexts/AuthContext"

export function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="w-full min-h-full pb-24 bg-slate-50/50">
      {user?.role !== "ADMIN" && <TopNavBar title="Settings & Preferences" />}
      
      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
             <SettingsIcon className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage your account preferences and system behavior.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand" />
              Notifications
            </h2>
            <div className="space-y-4">
              <ToggleItem 
                title="Email Notifications" 
                description="Receive updates about your claims and reports via email."
                enabled={notifications}
                onChange={setNotifications}
              />
              <ToggleItem 
                title="Push Notifications" 
                description="Get instant alerts on your device for new matches."
                enabled={true}
                onChange={() => {}}
              />
            </div>
          </section>

          {/* Privacy & Security */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand" />
              Privacy & Security
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-brand/20 hover:bg-brand/5 transition-all text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-800">Change Password</p>
                  <p className="text-xs text-slate-500 font-medium">Update your account security</p>
                </div>
                <Shield className="w-4 h-4 text-slate-300 group-hover:text-brand" />
              </button>
              <button className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-brand/20 hover:bg-brand/5 transition-all text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-800">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500 font-medium">Add an extra layer of protection</p>
                </div>
                <Eye className="w-4 h-4 text-slate-300 group-hover:text-brand" />
              </button>
            </div>
          </section>

          {/* Appearance */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sun className="w-5 h-5 text-brand" />
              Appearance
            </h2>
            <div className="flex gap-4">
              <AppearanceOption 
                icon={<Sun className="w-5 h-5" />} 
                label="Light" 
                active={!darkMode} 
                onClick={() => setDarkMode(false)} 
              />
              <AppearanceOption 
                icon={<Moon className="w-5 h-5" />} 
                label="Dark" 
                active={darkMode} 
                onClick={() => setDarkMode(true)} 
              />
              <AppearanceOption 
                icon={<Laptop className="w-5 h-5" />} 
                label="System" 
                active={false} 
                onClick={() => {}} 
              />
            </div>
          </section>

          {user?.role === "ADMIN" && (
             /* Admin Specific Settings */
            <section className="bg-navy rounded-3xl p-8 text-white">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-white/80" />
                Administrative Controls
              </h2>
              <div className="space-y-4">
                 <button className="w-full text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                    <p className="text-sm font-bold">Manage Campus Zones</p>
                    <p className="text-xs text-white/80 font-medium">Configure pick-up locations and categories</p>
                 </button>
                 <button className="w-full text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                    <p className="text-sm font-bold">Staff Role Permissions</p>
                    <p className="text-xs text-white/80 font-medium">Edit permissions for staff and security personnel</p>
                 </button>
              </div>
            </section>
          )}

          <div className="pt-6 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-brand text-white rounded-2xl font-bold shadow-lg shadow-brand/20 hover:bg-brand-active active:scale-95 transition-all flex items-center gap-2"
            >
              {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function ToggleItem({ title, description, enabled, onChange }: { title: string, description: string, enabled: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 font-medium">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full p-1 transition-all ${enabled ? 'bg-brand' : 'bg-slate-200'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function AppearanceOption({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${active ? 'border-brand bg-brand/5 text-brand' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
    >
      {icon}
      <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
    </button>
  )
}
