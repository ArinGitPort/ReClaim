import { Bell, Building, Database, Map, Shield } from "lucide-react"
import { dailyOperationsPermissions } from "@/lib/adminPermissions"
import type { SettingsTab, SystemSettings } from "./types"

export const settingsTabs: Array<{ id: SettingsTab; label: string; icon: typeof Building }> = [
  { id: "general", label: "General System", icon: Building },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "zones", label: "Campus Zones", icon: Map },
  { id: "alerts", label: "Alert Templates", icon: Bell },
  { id: "retention", label: "Retention Policy", icon: Database },
]

export const fallbackSettings: SystemSettings = {
  institution: {
    institutionName: "University of Technology",
    supportEmail: "lostandfound@university.edu",
    phone: "+1 (555) 123-4567",
  },
  roles: {
    defaultStaffPermissions: dailyOperationsPermissions,
    requireAdminForSettings: true,
  },
  campusZones: ["Main Library", "Gym", "Cafeteria", "Student Union", "Engineering Building", "Science Building", "Admin Office"],
  alertTemplates: {
    claimApproved: "Your claim has been approved. Please prepare your pickup token and campus ID.",
    claimDenied: "Your claim could not be verified. Please review the administrator note for details.",
    inquiryRequired: "We need more details before we can verify your claim.",
  },
  retentionPolicy: {
    foundItemRetentionDays: 90,
    dismissedSnapshotRetentionDays: 30,
    auditLogRetentionDays: 365,
  },
}

export function getSettingsTabDescription(tab: SettingsTab) {
  if (tab === "general") return "Primary details used across the Lost & Found portal."
  if (tab === "roles") return "Default admin access assigned to new staff accounts."
  if (tab === "zones") return "Campus locations shown to staff while logging and reviewing items."
  if (tab === "alerts") return "Reusable copy for common claim notification states."
  return "Retention windows for system records and automated evidence."
}
