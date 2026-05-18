import { AuditAction } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
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
      allowStaffManageInventory: z.boolean(),
      allowStaffManageClaims: z.boolean(),
      allowStaffViewReports: z.boolean(),
      requireAdminForSettings: z.boolean(),
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
