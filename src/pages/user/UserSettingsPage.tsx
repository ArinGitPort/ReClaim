import { Bell, Moon, Laptop, Sun, Save, Mail, Smartphone } from "lucide-react"
import { useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"

export function UserSettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="w-full min-h-screen pb-24 bg-slate-50/50">
      <TopNavBar title="Settings" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account preferences and system behavior.</p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#1E2F85] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#1E2F85]/90 focus-visible:outline-none"
          >
             {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save</>}
          </button>
        </div>

        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Notifications</h3>
              <p className="text-sm text-slate-500">Configure how you receive alerts and updates.</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /> Email Notifications</span>
                  <p className="text-xs text-slate-500 mt-1">Receive updates about your claims and reports via email.</p>
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
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-2"><Smartphone className="h-4 w-4 text-slate-500" /> Push Notifications</span>
                  <p className="text-xs text-slate-500 mt-1">Get instant alerts on your device for new matches.</p>
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
              <h3 className="font-semibold leading-none tracking-tight">Appearance</h3>
              <p className="text-sm text-slate-500">Customize the theme of your application interface.</p>
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

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-white text-slate-950 shadow-sm mt-8">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight text-red-600">Danger Zone</h3>
              <p className="text-sm text-slate-500">Irreversible, destructive actions regarding your account.</p>
            </div>
            <div className="p-6 pt-0 border-t border-red-100 flex items-center justify-between">
              <div className="mt-4">
                 <p className="text-sm font-medium text-slate-900">Delete Account</p>
                 <p className="text-xs text-slate-500 mt-1 max-w-[280px]">Removing your account permanently deletes all claims and logs associated with identity.</p>
              </div>
              <button className="inline-flex h-9 items-center justify-center rounded-md bg-red-50 mt-4 px-4 py-2 text-sm font-medium text-red-600 shadow-sm border border-red-200 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:outline-none">
                Request Deletion
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
