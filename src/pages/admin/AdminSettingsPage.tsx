import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  SettingsContentCard,
  SettingsSidebar,
  SystemIntegrationsPanel,
  useSystemSettings,
  type SettingsTab,
} from "@/features/admin/settings"

export function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const settings = useSystemSettings(activeTab)

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Configure campus zones, notification copy, integrations, and access policy.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="xl:col-span-3 space-y-6">
          <SettingsContentCard activeTab={activeTab} settings={settings} />
          <SystemIntegrationsPanel
            integrations={settings.integrations}
            onConfigureVision={() => navigate("/admin/camera-settings")}
          />
        </div>
      </div>
    </div>
  )
}
