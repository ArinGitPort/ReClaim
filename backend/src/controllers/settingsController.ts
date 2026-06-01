import { AdminPermission, AuditAction } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { hasDuplicateAdminPermissions } from "@/config/adminPermissions.js";
import { prisma } from "@/lib/prisma.js";
import { logAudit } from "@/services/auditService.js";
import { getSystemSettings, updateSystemSettings } from "@/services/settingsService.js";

const settingsSchema = z.object({
  institution: z
    .object({
      institutionName: z.string().trim().min(2),
      supportEmail: z.string().trim().email(),
      phone: z.string().trim().min(3),
    })
    .optional(),
  roles: z
    .object({
      defaultStaffPermissions: z.array(z.nativeEnum(AdminPermission)).min(1, "Select at least one default staff permission"),
      requireAdminForSettings: z.boolean(),
    })
    .superRefine((roles, ctx) => {
      if (hasDuplicateAdminPermissions(roles.defaultStaffPermissions)) {
        ctx.addIssue({
          code: "custom",
          path: ["defaultStaffPermissions"],
          message: "Default staff permissions cannot contain duplicates",
        });
      }

      if (roles.requireAdminForSettings && roles.defaultStaffPermissions.includes(AdminPermission.SYSTEM_SETTINGS)) {
        ctx.addIssue({
          code: "custom",
          path: ["defaultStaffPermissions"],
          message: "System Settings cannot be assigned to default staff while admin-only settings are enabled",
        });
      }
    })
    .optional(),
  campusZones: z.array(z.string().trim().min(2)).min(1).optional(),
  alertTemplates: z
    .object({
      claimApproved: z.string().trim().min(10),
      claimDenied: z.string().trim().min(10),
      inquiryRequired: z.string().trim().min(10),
    })
    .optional(),
  retentionPolicy: z
    .object({
      foundItemRetentionDays: z.coerce.number().int().min(1).max(3650),
      dismissedSnapshotRetentionDays: z.coerce.number().int().min(1).max(3650),
      auditLogRetentionDays: z.coerce.number().int().min(30).max(3650),
    })
    .optional(),
});

export async function getSettings(_req: Request, res: Response): Promise<void> {
  const [settings, totalCameras, aiEnabledCameras, onlineCameras, lastPingCamera] = await Promise.all([
    getSystemSettings(),
    prisma.camera.count(),
    prisma.camera.count({ where: { aiEnabled: true } }),
    prisma.camera.count({ where: { isOnline: true } }),
    prisma.camera.findFirst({
      where: { lastPingAtUtc: { not: null } },
      orderBy: { lastPingAtUtc: "desc" },
      select: { lastPingAtUtc: true },
    }),
  ]);

  res.json({
    settings,
    integrations: {
      computerVision: {
        status: aiEnabledCameras > 0 && onlineCameras > 0 ? "online" : aiEnabledCameras > 0 ? "idle" : "not_configured",
        totalCameras,
        aiEnabledCameras,
        onlineCameras,
        lastPingAtUtc: lastPingCamera?.lastPingAtUtc ?? null,
      },
    },
  });
}

export async function patchSettings(req: Request, res: Response): Promise<void> {
  const body = settingsSchema.parse(req.body);

  const settings = await updateSystemSettings({
    settings: body,
    actorUserId: req.user!.id,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.SYSTEM_SETTINGS_UPDATED,
    targetType: "system_settings",
    targetId: "system",
    targetReferenceCode: "system",
    description: "Admin updated system settings",
    payload: {
      targetReferenceCode: "system",
      sections: Object.keys(body),
    },
  });

  res.json({ settings });
}

export async function applyDefaultStaffPermissions(req: Request, res: Response): Promise<void> {
  const settings = await getSystemSettings();
  const result = await prisma.user.updateMany({
    where: { role: "STAFF" },
    data: {
      adminPermissions: {
        set: settings.roles.defaultStaffPermissions,
      },
    },
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.SYSTEM_SETTINGS_UPDATED,
    targetType: "system_settings",
    targetId: "staff_default_permissions",
    targetReferenceCode: "staff_default_permissions",
    description: "Admin applied default permissions to existing staff accounts",
    payload: {
      targetReferenceCode: "staff_default_permissions",
      staffUpdated: result.count,
      defaultStaffPermissions: settings.roles.defaultStaffPermissions,
    },
  });

  res.json({
    staffUpdated: result.count,
    defaultStaffPermissions: settings.roles.defaultStaffPermissions,
  });
}
