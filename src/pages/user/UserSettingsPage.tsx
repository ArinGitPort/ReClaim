import { useState } from "react"
import {
  UserSettingsHeader,
  UserSettingsPanel,
  UserSettingsSidebar,
  useUserSettings,
  type UserSettingsTab,
} from "@/features/user/settings"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<UserSettingsTab>("account")
  const settings = useUserSettings()

  return (
    <div className="w-full min-h-full pb-24 bg-slate-50/30">
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account details, preferences, and password.</p>
        </div>

        <UserSettingsHeader user={settings.user} onEditProfile={setActiveTab} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          <UserSettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="md:col-span-3 space-y-6">
            <UserSettingsPanel activeTab={activeTab} state={settings} />
          </div>
        </div>
      </main>
    </div>
  )
}
