import { cn } from "@/lib/utils"
import { settingsTabs } from "./settingsConfig"
import type { SettingsTab } from "./types"

type SettingsSidebarProps = {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <div className="xl:col-span-1 space-y-1">
      {settingsTabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition-colors",
              isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
