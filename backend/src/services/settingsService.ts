import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";

const SYSTEM_SETTINGS_KEY = "system";

export type SystemSettings = {
  institution: {
    institutionName: string;
    supportEmail: string;
    phone: string;
  };
  roles: {
    allowStaffManageInventory: boolean;
    allowStaffManageClaims: boolean;
    allowStaffViewReports: boolean;
    requireAdminForSettings: boolean;
  };
  campusZones: string[];
  alertTemplates: {
    claimApproved: string;
    claimDenied: string;
    inquiryRequired: string;
  };
  retentionPolicy: {
    foundItemRetentionDays: number;
    dismissedSnapshotRetentionDays: number;
    auditLogRetentionDays: number;
  };
};

export const defaultSystemSettings: SystemSettings = {
  institution: {
    institutionName: "University of Technology",
    supportEmail: "lostandfound@university.edu",
    phone: "+1 (555) 123-4567",
  },
  roles: {
    allowStaffManageInventory: true,
    allowStaffManageClaims: true,
    allowStaffViewReports: true,
    requireAdminForSettings: true,
  },
  campusZones: [
    "Main Library",
    "Gym",
    "Cafeteria",
    "Student Union",
    "Engineering Building",
    "Science Building",
    "Admin Office",
  ],
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
};

export async function getSystemSettings(): Promise<SystemSettings> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: SYSTEM_SETTINGS_KEY },
  });

  return normalizeSettings(row?.value);
}

export async function updateSystemSettings(input: {
  settings: Partial<SystemSettings>;
  actorUserId: string;
}): Promise<SystemSettings> {
  const current = await getSystemSettings();
  const next = normalizeSettings({
    ...current,
    ...input.settings,
    institution: {
      ...current.institution,
      ...input.settings.institution,
    },
    roles: {
      ...current.roles,
      ...input.settings.roles,
    },
    alertTemplates: {
      ...current.alertTemplates,
      ...input.settings.alertTemplates,
    },
    retentionPolicy: {
      ...current.retentionPolicy,
      ...input.settings.retentionPolicy,
    },
    campusZones: input.settings.campusZones ?? current.campusZones,
  });

  await prisma.systemSetting.upsert({
    where: { key: SYSTEM_SETTINGS_KEY },
    create: {
      key: SYSTEM_SETTINGS_KEY,
      value: next as unknown as Prisma.InputJsonValue,
      updatedById: input.actorUserId,
    },
    update: {
      value: next as unknown as Prisma.InputJsonValue,
      updatedById: input.actorUserId,
    },
  });

  return next;
}

function normalizeSettings(value: Prisma.JsonValue | undefined): SystemSettings {
  const candidate = isRecord(value) ? value : {};
  const institution = isRecord(candidate.institution) ? candidate.institution : {};
  const roles = isRecord(candidate.roles) ? candidate.roles : {};
  const alertTemplates = isRecord(candidate.alertTemplates) ? candidate.alertTemplates : {};
  const retentionPolicy = isRecord(candidate.retentionPolicy) ? candidate.retentionPolicy : {};

  return {
    institution: {
      institutionName: readString(institution.institutionName, defaultSystemSettings.institution.institutionName),
      supportEmail: readString(institution.supportEmail, defaultSystemSettings.institution.supportEmail),
      phone: readString(institution.phone, defaultSystemSettings.institution.phone),
    },
    roles: {
      allowStaffManageInventory: readBoolean(roles.allowStaffManageInventory, defaultSystemSettings.roles.allowStaffManageInventory),
      allowStaffManageClaims: readBoolean(roles.allowStaffManageClaims, defaultSystemSettings.roles.allowStaffManageClaims),
      allowStaffViewReports: readBoolean(roles.allowStaffViewReports, defaultSystemSettings.roles.allowStaffViewReports),
      requireAdminForSettings: readBoolean(roles.requireAdminForSettings, defaultSystemSettings.roles.requireAdminForSettings),
    },
    campusZones: readStringArray(candidate.campusZones, defaultSystemSettings.campusZones),
    alertTemplates: {
      claimApproved: readString(alertTemplates.claimApproved, defaultSystemSettings.alertTemplates.claimApproved),
      claimDenied: readString(alertTemplates.claimDenied, defaultSystemSettings.alertTemplates.claimDenied),
      inquiryRequired: readString(alertTemplates.inquiryRequired, defaultSystemSettings.alertTemplates.inquiryRequired),
    },
    retentionPolicy: {
      foundItemRetentionDays: readNumber(retentionPolicy.foundItemRetentionDays, defaultSystemSettings.retentionPolicy.foundItemRetentionDays),
      dismissedSnapshotRetentionDays: readNumber(
        retentionPolicy.dismissedSnapshotRetentionDays,
        defaultSystemSettings.retentionPolicy.dismissedSnapshotRetentionDays
      ),
      auditLogRetentionDays: readNumber(retentionPolicy.auditLogRetentionDays, defaultSystemSettings.retentionPolicy.auditLogRetentionDays),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const unique = Array.from(
    new Set(value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean))
  );

  return unique.length > 0 ? unique : fallback;
}
