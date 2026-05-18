import { Bell, Palette, Shield, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserSettingsTab } from "./types"

type UserSettingsSidebarProps = {
  activeTab: UserSettingsTab
  onTabChange: (tab: UserSettingsTab) => void
}

const tabs = [
  { id: "account", label: "Account Detail", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
] satisfies Array<{ id: UserSettingsTab; label: string; icon: typeof User }>

export function UserSettingsSidebar({ activeTab, onTabChange }: UserSettingsSidebarProps) {
  return (
    <div className="md:col-span-1 space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition-colors",
              activeTab === tab.id ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
