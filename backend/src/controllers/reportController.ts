import { AuditAction, ReportStatus, type Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { closeReportByStudent, listReports, submitLostReport, updateReportStatus } from "@/services/reportService.js";
import { logAudit } from "@/services/auditService.js";
import { emitReportStatusUpdated } from "@/realtime/socket.js";
import { createNotificationForUser, createNotificationsForRoles } from "@/services/notificationService.js";
import { emitNotificationCreated } from "@/realtime/socket.js";
import { emitItemUpdated } from "@/realtime/socket.js";

type NotificationPayload = {
  id: string;
  userId: string;
  title: string;
  message: string;
  route: string | null;
  readAt: Date | null;
  createdAt: Date;
};

const createReportSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  color: z.string().min(2),
  location: z.string().min(2),
  reportedLostAtUtc: z.string().datetime(),
  timeWindow: z.string().optional(),
  proofData: z.record(z.string(), z.unknown()),
});

const updateReportSchema = z.object({
  status: z.nativeEnum(ReportStatus),
  matchedItemId: z.string().uuid().optional(),
});

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function postReport(req: Request, res: Response): Promise<void> {
  const body = createReportSchema.parse(req.body);

  const report = await submitLostReport({
    userId: req.user!.id,
    title: body.title,
    category: body.category,
    color: body.color,
    location: body.location,
    reportedLostAtUtc: new Date(body.reportedLostAtUtc),
    timeWindow: body.timeWindow,
    proofData: body.proofData as Prisma.InputJsonValue,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.REPORT_SUBMITTED,
    targetType: "lost_report",
    targetId: report.id,
    description: "Student submitted a lost report",
    payload: {
      reportCode: report.reportCode,
      category: report.category,
    },
  });

  const adminNotifications = await createNotificationsForRoles({
    roles: ["ADMIN", "STAFF"],
    title: "New Lost Report",
    message: `${report.reportCode} was submitted and needs review.`,
    route: "/admin/reports",
  });

  adminNotifications.forEach((notification: NotificationPayload) => {
    emitNotificationCreated({
      userId: notification.userId,
      notification,
    });
  });

  res.status(201).json({ report });
}

export async function getReports(req: Request, res: Response): Promise<void> {
  const statusQuery = typeof req.query.status === "string" ? req.query.status : undefined;
  const status = statusQuery && Object.values(ReportStatus).includes(statusQuery as ReportStatus)
    ? (statusQuery as ReportStatus)
    : undefined;

  const userScoped = req.user?.role === "STUDENT" ? req.user.id : undefined;
  const reports = await listReports({ userId: userScoped, status });
  res.json({ reports });
}

export async function patchReport(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = updateReportSchema.parse(req.body);
  const report = await updateReportStatus({
    reportId: id,
    status: body.status,
    matchedItemId: body.matchedItemId,
    adminId: req.user!.id,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: body.status === ReportStatus.MATCHED ? AuditAction.REPORT_LINKED : AuditAction.REPORT_UPDATED,
    targetType: "lost_report",
    targetId: report.id,
    description: body.status === ReportStatus.MATCHED
      ? `Admin linked report ${report.reportCode} to found item ${body.matchedItemId}`
      : `Report updated to ${body.status}`,
    payload: {
      status: report.status,
      matchedItemId: report.matchedItemId,
    },
  });

  emitReportStatusUpdated({
    reportId: report.id,
    reportCode: report.reportCode,
    status: report.status,
    reporterUserId: report.reporterUserId,
    matchedItemId: report.matchedItemId,
  });

  const studentNotification = await createNotificationForUser({
    userId: report.reporterUserId,
    title: "Lost Report Updated",
    message: `${report.reportCode} is now ${report.status.replaceAll("_", " ")}.`,
    route: "/my-reports",
  });

  emitNotificationCreated({
    userId: studentNotification.userId,
    notification: studentNotification,
  });

  const adminNotifications = await createNotificationsForRoles({
    roles: ["ADMIN", "STAFF"],
    title: "Report Status Changed",
    message: `${report.reportCode} moved to ${report.status.replaceAll("_", " ")}.`,
    route: "/admin/reports",
  });

  adminNotifications.forEach((notification: NotificationPayload) => {
    emitNotificationCreated({
      userId: notification.userId,
      notification,
    });
  });

  if (report.status === ReportStatus.MATCHED && report.matchedItemId) {
    emitItemUpdated({
      itemId: report.matchedItemId,
      status: "CLAIM_PENDING",
    });
  }

  res.json({ report });
}

export async function patchReportClose(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);

  const report = await closeReportByStudent({
    reportId: id,
    userId: req.user!.id,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.REPORT_UPDATED,
    targetType: "lost_report",
    targetId: report.id,
    description: "Student closed lost report ticket",
    payload: {
      status: report.status,
      matchedItemId: report.matchedItemId,
    },
  });

  emitReportStatusUpdated({
    reportId: report.id,
    reportCode: report.reportCode,
    status: report.status,
    reporterUserId: report.reporterUserId,
    matchedItemId: report.matchedItemId,
  });

  const adminNotifications = await createNotificationsForRoles({
    roles: ["ADMIN", "STAFF"],
    title: "Report Closed by Student",
    message: `${report.reportCode} was closed by the reporter.`,
    route: "/admin/reports",
  });

  adminNotifications.forEach((notification: NotificationPayload) => {
    emitNotificationCreated({
      userId: notification.userId,
      notification,
    });
  });

  res.json({ report });
}
