import { AdminPermission } from "@prisma/client";

export const allAdminPermissions = Object.values(AdminPermission);

export const dailyOperationsPermissions: AdminPermission[] = [
  AdminPermission.DASHBOARD,
  AdminPermission.INVENTORY,
  AdminPermission.REPORTS,
  AdminPermission.CLAIMS,
  AdminPermission.LIVE_MONITOR,
  AdminPermission.SNAPSHOTS,
  AdminPermission.DISMISSED_SNAPSHOTS,
  AdminPermission.HANDOVER_LOG,
  AdminPermission.MATCH_HISTORY,
];

export const sensitiveAdminPermissions: AdminPermission[] = [
  AdminPermission.USER_DIRECTORY,
  AdminPermission.AUDIT_LOGS,
  AdminPermission.CAMERA_SETTINGS,
  AdminPermission.SYSTEM_SETTINGS,
];

export function normalizeAdminPermissions(value: unknown, fallback: AdminPermission[] = []): AdminPermission[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const valid = new Set(allAdminPermissions);
  const unique = Array.from(new Set(value.filter((entry): entry is AdminPermission => valid.has(entry as AdminPermission))));
  return unique;
}

export function hasDuplicateAdminPermissions(value: AdminPermission[]): boolean {
  return new Set(value).size !== value.length;
}
