import type { AdminPermission } from "@/lib/adminPermissions"

export type SettingsTab = "general" | "roles" | "zones" | "alerts" | "retention"

export type SystemSettings = {
  institution: {
    institutionName: string
    supportEmail: string
    phone: string
  }
  roles: {
    defaultStaffPermissions: AdminPermission[]
    requireAdminForSettings: boolean
  }
  campusZones: string[]
  alertTemplates: {
    claimApproved: string
    claimDenied: string
    inquiryRequired: string
  }
  retentionPolicy: {
    foundItemRetentionDays: number
    dismissedSnapshotRetentionDays: number
    auditLogRetentionDays: number
  }
}

export type SettingsResponse = {
  settings: SystemSettings
  integrations: {
    computerVision: {
      status: "online" | "idle" | "not_configured"
      totalCameras: number
      aiEnabledCameras: number
      onlineCameras: number
      lastPingAtUtc?: string | null
    }
  }
}
