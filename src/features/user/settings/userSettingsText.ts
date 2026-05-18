import type { UserSettingsTab } from "./types"

export function getUserSettingsTitle(tab: UserSettingsTab): string {
  if (tab === "notifications") return "Notification Preferences"
  if (tab === "appearance") return "Appearance"
  if (tab === "security") return "Account Security"
  return "Personal Information"
}

export function getUserSettingsDescription(tab: UserSettingsTab): string {
  if (tab === "notifications") return "Choose which system events should appear in your notification feed."
  if (tab === "appearance") return "Adjust how ReClaim looks on this device."
  if (tab === "security") return "Change your login password."
  return "Update your contact details so staff can reach you when items are found."
}
