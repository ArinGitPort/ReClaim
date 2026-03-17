import { AuditAction } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { confirmHandoverByToken, createHandoverLog, getHandoverPreviewByToken } from "../services/handoverService.js";
import { logAudit } from "../services/auditService.js";
import { emitReportStatusUpdated } from "../realtime/socket.js";
import { createNotificationForUser, createNotificationsForRoles } from "../services/notificationService.js";
import { emitNotificationCreated } from "../realtime/socket.js";

type NotificationPayload = {
  id: string;
  userId: string;
  title: string;
  message: string;
  route: string | null;
  readAt: Date | null;
  createdAt: Date;
};

const handoverSchema = z.object({
  foundItemId: z.string().uuid(),
  claimId: z.string().uuid().optional(),
  releasedToUserId: z.string().uuid(),
  pickupTokenPresented: z.string().min(2),
  idVerified: z.boolean(),
  note: z.string().optional(),
});

const handoverPreviewSchema = z.object({
  pickupToken: z.string().min(2),
});

const handoverConfirmSchema = z.object({
  pickupToken: z.string().min(2),
  idVerified: z.boolean(),
  note: z.string().optional(),
});

export async function getHandoverPreview(req: Request, res: Response): Promise<void> {
  const { pickupToken } = handoverPreviewSchema.parse(req.query);
  const preview = await getHandoverPreviewByToken({ pickupToken });
  res.json({ preview });
}

export async function postHandover(req: Request, res: Response): Promise<void> {
  const body = handoverSchema.parse(req.body);

  const handover = await createHandoverLog(body);

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.HANDOVER_COMPLETED,
    targetType: "handover",
    targetId: handover.id,
    description: "Item handover completed",
    payload: {
      foundItemId: handover.foundItemId,
      releasedToUserId: handover.releasedToUserId,
    },
  });

  const studentNotification = await createNotificationForUser({
    userId: handover.releasedToUserId,
    title: "Handover Completed",
    message: "Your item handover was successfully completed.",
    route: "/my-claims",
  });

  emitNotificationCreated({
    userId: studentNotification.userId,
    notification: studentNotification,
  });

  const adminNotifications = await createNotificationsForRoles({
    roles: ["ADMIN", "STAFF"],
    title: "Handover Logged",
    message: "An item handover was confirmed and marked returned.",
    route: "/admin/handover-log",
  });

  adminNotifications.forEach((notification: NotificationPayload) => {
    emitNotificationCreated({
      userId: notification.userId,
      notification,
    });
  });

  res.status(201).json({ handover });
}

export async function postHandoverConfirm(req: Request, res: Response): Promise<void> {
  const body = handoverConfirmSchema.parse(req.body);
  const result = await confirmHandoverByToken(body);

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.HANDOVER_COMPLETED,
    targetType: "handover",
    targetId: result.handover.id,
    description: "Item handover completed via pickup token validation",
    payload: {
      foundItemId: result.handover.foundItemId,
      releasedToUserId: result.handover.releasedToUserId,
      claimId: result.handover.claimId,
    },
  });

  if (result.resolvedReport) {
    emitReportStatusUpdated({
      reportId: result.resolvedReport.id,
      reportCode: result.resolvedReport.reportCode,
      status: result.resolvedReport.status,
      reporterUserId: result.resolvedReport.reporterUserId,
      matchedItemId: result.resolvedReport.matchedItemId,
    });
  }

  res.status(201).json({
    handover: result.handover,
    resolvedReport: result.resolvedReport,
  });
}
