import {
  Activity,
  Archive,
  ArchiveRestore,
  Camera,
  FileSearch,
  HandMetal,
  History,
  LayoutDashboard,
  Link,
  Package,
  Settings,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react"

export type AdminPermission =
  | "DASHBOARD"
  | "INVENTORY"
  | "REPORTS"
  | "CLAIMS"
  | "LIVE_MONITOR"
  | "SNAPSHOTS"
  | "DISMISSED_SNAPSHOTS"
  | "HANDOVER_LOG"
  | "MATCH_HISTORY"
  | "USER_DIRECTORY"
  | "DELETED_ITEMS"
  | "AUDIT_LOGS"
  | "CAMERA_SETTINGS"
  | "SYSTEM_SETTINGS"

export const allAdminPermissions: AdminPermission[] = [
  "DASHBOARD",
  "INVENTORY",
  "REPORTS",
  "CLAIMS",
  "LIVE_MONITOR",
  "SNAPSHOTS",
  "DISMISSED_SNAPSHOTS",
  "HANDOVER_LOG",
  "MATCH_HISTORY",
  "USER_DIRECTORY",
  "DELETED_ITEMS",
  "AUDIT_LOGS",
  "CAMERA_SETTINGS",
  "SYSTEM_SETTINGS",
]

export const dailyOperationsPermissions: AdminPermission[] = [
  "DASHBOARD",
  "INVENTORY",
  "REPORTS",
  "CLAIMS",
  "LIVE_MONITOR",
  "SNAPSHOTS",
  "DISMISSED_SNAPSHOTS",
  "HANDOVER_LOG",
  "MATCH_HISTORY",
]

export type AdminNavItem = {
  permission: AdminPermission
  to: string
  label: string
  description: string
  risk: "standard" | "elevated" | "critical"
  section: "Operations" | "Automated Capture" | "Records & Accountability" | "System Administration"
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { permission: "DASHBOARD", to: "/admin/dashboard", label: "System Dashboard", description: "View operational queues, metrics, and work routing.", risk: "standard", section: "Operations", icon: LayoutDashboard },
  { permission: "INVENTORY", to: "/admin/inventory", label: "Inventory Management", description: "Create, edit, archive, restore, and dispose found-item records.", risk: "elevated", section: "Operations", icon: Package },
  { permission: "REPORTS", to: "/admin/reports", label: "Missing Items Report", description: "Review lost reports, message students, and link possible matches.", risk: "elevated", section: "Operations", icon: FileSearch },
  { permission: "CLAIMS", to: "/admin/claims", label: "Claims Verification", description: "Approve, deny, or request more proof for ownership claims.", risk: "elevated", section: "Operations", icon: HandMetal },
  { permission: "LIVE_MONITOR", to: "/admin/live-monitor", label: "Live Monitor", description: "View live camera feeds and AI service status.", risk: "standard", section: "Operations", icon: Activity },
  { permission: "SNAPSHOTS", to: "/admin/snapshots", label: "AI Snapshot Gallery", description: "Review AI detections and convert snapshots into inventory.", risk: "elevated", section: "Automated Capture", icon: Camera },
  { permission: "DISMISSED_SNAPSHOTS", to: "/admin/dismissed-snapshots", label: "Dismissed Snapshots", description: "Inspect and restore dismissed AI evidence.", risk: "elevated", section: "Automated Capture", icon: ArchiveRestore },
  { permission: "HANDOVER_LOG", to: "/admin/handover-log", label: "Handover Log", description: "Process pickup tokens and restore mistaken handovers.", risk: "elevated", section: "Records & Accountability", icon: History },
  { permission: "MATCH_HISTORY", to: "/admin/match-history", label: "Match History", description: "Audit and revert item/report match decisions.", risk: "elevated", section: "Records & Accountability", icon: Link },
  { permission: "USER_DIRECTORY", to: "/admin/user-directory", label: "User Directory", description: "View users and manage account roles, status, passwords, and staff access.", risk: "critical", section: "Records & Accountability", icon: Users },
  { permission: "DELETED_ITEMS", to: "/admin/deleted-items", label: "Deleted Items", description: "Review and restore archived or deleted item records.", risk: "elevated", section: "Records & Accountability", icon: Archive },
  { permission: "AUDIT_LOGS", to: "/admin/logs", label: "Audit Trail", description: "View immutable administrative activity and payload history.", risk: "critical", section: "System Administration", icon: History },
  { permission: "CAMERA_SETTINGS", to: "/admin/camera-settings", label: "Camera Settings", description: "Add, edit, restart, or delete camera sources and AI thresholds.", risk: "critical", section: "System Administration", icon: Video },
  { permission: "SYSTEM_SETTINGS", to: "/admin/settings", label: "System Settings", description: "Change institution, retention, alert, zone, and RBAC defaults.", risk: "critical", section: "System Administration", icon: Settings },
]

export const adminPermissionLabels: Record<AdminPermission, string> = Object.fromEntries(
  adminNavItems.map((item) => [item.permission, item.label]),
) as Record<AdminPermission, string>

export const sensitiveAdminPermissions: AdminPermission[] = adminNavItems
  .filter((item) => item.risk === "critical")
  .map((item) => item.permission)

export function hasAdminPermission(
  user: { role: "STUDENT" | "STAFF" | "ADMIN"; adminPermissions?: AdminPermission[] | null } | null,
  permission: AdminPermission,
) {
  if (!user) return false
  if (user.role === "ADMIN") return true
  if (user.role !== "STAFF") return false
  return Boolean(user.adminPermissions?.includes(permission))
}

export function getFirstAllowedAdminPath(user: { role: "STUDENT" | "STAFF" | "ADMIN"; adminPermissions?: AdminPermission[] | null } | null) {
  if (!user || user.role === "STUDENT") return null
  if (user.role === "ADMIN") return "/admin/dashboard"
  return adminNavItems.find((item) => hasAdminPermission(user, item.permission))?.to ?? null
}

export function getPermissionForAdminPath(pathname: string): AdminPermission | null {
  const match = adminNavItems
    .slice()
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
  return match?.permission ?? null
}
