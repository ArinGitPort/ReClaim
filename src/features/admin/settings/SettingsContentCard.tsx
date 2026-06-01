import { CheckCircle2, Loader2 } from "lucide-react"
import {
  AlertSettingsPanel,
  GeneralSettingsPanel,
  RetentionSettingsPanel,
  RolesSettingsPanel,
  ZonesSettingsPanel,
} from "./SettingsPanels"
import type { useSystemSettings } from "./useSystemSettings"
import type { SettingsTab } from "./types"

type SettingsContentCardProps = {
  activeTab: SettingsTab
  settings: ReturnType<typeof useSystemSettings>
}

export function SettingsContentCard({ activeTab, settings }: SettingsContentCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{settings.activeTabLabel}</h3>
          <p className="text-sm text-slate-500 mt-1">{settings.activeTabDescription}</p>
        </div>
        {settings.isSaved && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </div>
        )}
      </div>

      {settings.isLoading ? (
        <div className="p-10 flex items-center gap-3 text-slate-500 font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading system settings...
        </div>
      ) : (
        <>
          {activeTab === "general" && <GeneralSettingsPanel form={settings.form} onSubmit={settings.saveGeneral} />}
          {activeTab === "roles" && (
            <RolesSettingsPanel
              form={settings.form}
              onSubmit={settings.saveRoles}
              onApplyToExistingStaff={settings.saveRolesAndApplyToStaff}
              isApplyingStaffDefaults={settings.isApplyingStaffDefaults}
              staffDefaultsAppliedCount={settings.staffDefaultsAppliedCount}
            />
          )}
          {activeTab === "zones" && (
            <ZonesSettingsPanel
              form={settings.form}
              onSubmit={settings.saveZones}
              campusZones={settings.campusZones}
              zoneDraft={settings.zoneDraft}
              onZoneDraftChange={settings.setZoneDraft}
              onAddZone={settings.addZone}
              onRemoveZone={settings.removeZone}
            />
          )}
          {activeTab === "alerts" && <AlertSettingsPanel form={settings.form} onSubmit={settings.saveAlerts} />}
          {activeTab === "retention" && <RetentionSettingsPanel form={settings.form} onSubmit={settings.saveRetention} />}

          {settings.error && <div className="mx-6 mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{settings.error}</div>}
        </>
      )}
    </div>
  )
}
