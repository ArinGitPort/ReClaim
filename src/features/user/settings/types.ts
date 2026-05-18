export type UserSettingsTab = "account" | "notifications" | "appearance" | "security"

export type NotificationPreferences = {
  claimUpdates: boolean
  reportUpdates: boolean
  pickupReminders: boolean
}

export const defaultNotificationPreferences: NotificationPreferences = {
  claimUpdates: true,
  reportUpdates: true,
  pickupReminders: true,
}
