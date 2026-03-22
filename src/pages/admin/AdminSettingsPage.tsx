import { Bell, Moon, Laptop, Sun, Save, Mail, Smartphone, Globe, Shield } from "lucide-react"
import { useState } from "react"

export function AdminSettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="w-full min-h-screen pb-24 bg-slate-50/50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage global preferences and infrastructure behavior.</p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#1E2F85] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#1E2F85]/90 focus-visible:outline-none"
          >
             {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Configuration</>}
          </button>
        </div>

        <div className="space-y-6">

          {/* Admin Controls */}
          <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 bg-slate-50/50 rounded-t-xl border-b border-slate-100">
              <h3 className="font-semibold leading-none tracking-tight">Administrative Routing</h3>
              <p className="text-sm text-slate-500">Manage internal system operations and staff authorities.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 rounded-lg border border-slate-200 p-4 transition-all hover:bg-slate-50 cursor-pointer">
                  <Globe className="h-5 w-5 text-[#1E2F85] mb-2" />
                  <h4 className="font-medium text-sm text-slate-900 mb-1">Manage Campus Zones</h4>
                  <p className="text-xs text-slate-500">Configure pick-up locations and infrastructure categories</p>
                </div>
                <div className="flex-1 rounded-lg border border-slate-200 p-4 transition-all hover:bg-slate-50 cursor-pointer">
                  <Shield className="h-5 w-5 text-[#1E2F85] mb-2" />
                  <h4 className="font-medium text-sm text-slate-900 mb-1">Staff Role Permissions</h4>
                  <p className="text-xs text-slate-500">Edit access permissions for staff and security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Alert Hooks</h3>
              <p className="text-sm text-slate-500">Configure how you receive system alerts and infrastructure updates.</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /> Supervisor Emails</span>
                  <p className="text-xs text-slate-500 mt-1">Receive daily digest updates regarding lost batches.</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${notifications ? 'bg-[#1E2F85]' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-2"><Smartphone className="h-4 w-4 text-slate-500" /> High-Priority Pings</span>
                  <p className="text-xs text-slate-500 mt-1">Get instant native push alerts for critical security events.</p>
                </div>
                <button className="inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors bg-[#1E2F85]">
                  <span className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform translate-x-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Card */}
          <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Console Appearance</h3>
              <p className="text-sm text-slate-500">Customize the theme of the terminal interface.</p>
            </div>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => setDarkMode(false)} className={`flex items-center justify-center gap-2 rounded-md border-2 p-4 transition-all hover:bg-slate-50 ${!darkMode ? 'border-[#1E2F85] bg-blue-50/50' : 'border-slate-200'}`}>
                  <Sun className={`h-5 w-5 ${!darkMode ? 'text-[#1E2F85]' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${!darkMode ? 'text-[#1E2F85]' : 'text-slate-900'}`}>Light</span>
                </button>
                <button onClick={() => setDarkMode(true)} className={`flex items-center justify-center gap-2 rounded-md border-2 p-4 transition-all hover:bg-slate-50 ${darkMode ? 'border-[#1E2F85] bg-blue-50/50' : 'border-slate-200'}`}>
                  <Moon className={`h-5 w-5 ${darkMode ? 'text-[#1E2F85]' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-[#1E2F85]' : 'text-slate-900'}`}>Dark</span>
                </button>
                <button className="flex items-center justify-center gap-2 rounded-md border-2 border-slate-200 p-4 transition-all hover:bg-slate-50 text-slate-900">
                  <Laptop className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
