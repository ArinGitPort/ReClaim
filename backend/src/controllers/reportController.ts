import { AuditAction, ReportStatus, type Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { closeReportByStudent, listReports, submitLostReport, updateReportStatus } from "@/services/reportService.js";
import { logAudit } from "@/services/auditService.js";
import { HttpError } from "@/utils/errors.js";
import { emitReportStatusUpdated } from "@/realtime/socket.js";
import { createNotificationForUser, createNotificationsForRoles } from "@/services/notificationService.js";
import { emitNotificationCreated } from "@/realtime/socket.js";
import { emitItemUpdated } from "@/realtime/socket.js";
import { emitReportMessageCreated } from "@/realtime/socket.js";

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

const postReportMessageSchema = z.object({
  message: z.string().min(1),
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
    targetReferenceCode: report.reportCode,
    payload: {
      targetReferenceCode: report.reportCode,
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

export async function postReportEvidence(req: Request, res: Response): Promise<void> {
  const files = Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];

  if (files.length === 0) {
    throw new HttpError(400, "No evidence files uploaded");
  }

  const evidenceUrls = files.map((file) => `/uploads/reports/${file.filename}`);
  res.status(201).json({ evidenceUrls });
}

export async function getReports(req: Request, res: Response): Promise<void> {
  const statusQuery = typeof req.query.status === "string" ? req.query.status : undefined;
  const statusInQuery = typeof req.query.statusIn === "string" ? req.query.statusIn : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const pageQuery = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limitQuery = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const status = statusQuery && Object.values(ReportStatus).includes(statusQuery as ReportStatus)
    ? (statusQuery as ReportStatus)
    : undefined;

  const statusIn = statusInQuery
    ? statusInQuery
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is ReportStatus => Object.values(ReportStatus).includes(value as ReportStatus))
    : undefined;

  const userScoped = req.user?.role === "STUDENT" ? req.user.id : undefined;
  const page = Number.isFinite(pageQuery) && (pageQuery as number) > 0 ? (pageQuery as number) : undefined;
  const limit = Number.isFinite(limitQuery) && (limitQuery as number) > 0 ? Math.min(limitQuery as number, 100) : undefined;

  const result = await listReports({ userId: userScoped, status, statusIn, search, category, page, limit });
  res.json({
    reports: result.reports,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pageCount: result.pageCount,
    },
  });
}

export async function patchReport(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = updateReportSchema.parse(req.body);

  const previous = await prisma.lostReport.findUnique({
    where: { id },
    select: {
      status: true,
      matchedItemId: true,
      reportCode: true,
    },
  });

  if (!previous) {
    throw new HttpError(404, "Report not found");
  }

  const [previousMatchedItem, nextMatchedItem] = await Promise.all([
    previous.matchedItemId
      ? prisma.foundItem.findUnique({ where: { id: previous.matchedItemId }, select: { id: true, code: true } })
      : Promise.resolve(null),
    body.matchedItemId
      ? prisma.foundItem.findUnique({ where: { id: body.matchedItemId }, select: { id: true, code: true } })
      : Promise.resolve(null),
  ]);

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
      ? `Admin linked report ${report.reportCode} to found item ${nextMatchedItem?.code ?? "unknown item"}`
      : `Report updated to ${body.status}`,
    targetReferenceCode: report.reportCode,
    payload: {
      targetReferenceCode: report.reportCode,
      changes: [
        {
          changedField: "status",
          oldValue: previous.status,
          newValue: report.status,
        },
        {
          changedField: "matchedItemId",
          oldValue: previous.matchedItemId ?? null,
          newValue: report.matchedItemId ?? null,
        },
        {
          changedField: "matchedItemCode",
          oldValue: previousMatchedItem?.code ?? null,
          newValue: nextMatchedItem?.code ?? null,
        },
      ].filter((change) => change.oldValue !== change.newValue),
      before: {
        status: previous.status,
        matchedItemId: previous.matchedItemId,
        matchedItemCode: previousMatchedItem?.code ?? null,
      },
      after: {
        status: report.status,
        matchedItemId: report.matchedItemId,
        matchedItemCode: nextMatchedItem?.code ?? null,
      },
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
    route: report.status === ReportStatus.MATCHED ? "/ready-to-claim" : "/my-reports",
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

  const previous = await prisma.lostReport.findUnique({
    where: { id },
    select: {
      status: true,
      matchedItemId: true,
      reportCode: true,
    },
  });

  if (!previous) {
    throw new HttpError(404, "Report not found");
  }

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
    targetReferenceCode: report.reportCode,
    payload: {
      targetReferenceCode: report.reportCode,
      changes: [
        {
          changedField: "status",
          oldValue: previous.status,
          newValue: report.status,
        },
        {
          changedField: "matchedItemId",
          oldValue: previous.matchedItemId ?? null,
          newValue: report.matchedItemId ?? null,
        },
      ].filter((change) => change.oldValue !== change.newValue),
      before: {
        status: previous.status,
        matchedItemId: previous.matchedItemId,
      },
      after: {
        status: report.status,
        matchedItemId: report.matchedItemId,
      },
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

export async function getReportMessages(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);

  const report = await prisma.lostReport.findUnique({ where: { id } });
  if (!report) {
    throw new HttpError(404, "Report not found");
  }

  if (req.user!.role === "STUDENT" && report.reporterUserId !== req.user!.id) {
    throw new HttpError(403, "You can only view your own report messages");
  }

  const messages = await prisma.reportMessage.findMany({
    where: { reportId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      sender: true,
      message: true,
      createdAt: true,
    },
  });

  res.json({ messages });
}

export async function postReportMessage(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = postReportMessageSchema.parse(req.body);

  const report = await prisma.lostReport.findUnique({ where: { id } });
  if (!report) {
    throw new HttpError(404, "Report not found");
  }

  if (req.user!.role === "STUDENT" && report.reporterUserId !== req.user!.id) {
    throw new HttpError(403, "You can only message on your own report");
  }

  if (report.status !== ReportStatus.ACTIVE_SEARCH && report.status !== ReportStatus.MATCHED) {
    throw new HttpError(400, "Messages are available after the report is authorized");
  }

  const message = await prisma.reportMessage.create({
    data: {
      reportId: id,
      sender: req.user!.role === "STUDENT" ? "STUDENT" : "ADMIN",
      message: body.message,
    },
    select: {
      id: true,
      sender: true,
      message: true,
      createdAt: true,
    },
  });

  const senderIsStudent = req.user!.role === "STUDENT";
  const notificationTitle = senderIsStudent ? "Student Report Message" : "Admin Report Message";
  const notificationMessage = senderIsStudent
    ? `${report.reportCode} has a new student message.`
    : `${report.reportCode} has a new staff message.`;

  if (senderIsStudent) {
    const adminNotifications = await createNotificationsForRoles({
      roles: ["ADMIN", "STAFF"],
      title: notificationTitle,
      message: notificationMessage,
      route: `/admin/reports?focus=${report.reportCode}`,
      type: "REPORT_MESSAGE",
    });

    adminNotifications.forEach((notification: NotificationPayload) => {
      emitNotificationCreated({
        userId: notification.userId,
        notification,
      });
    });
  } else {
    const reporterNotification = await createNotificationForUser({
      userId: report.reporterUserId,
      title: notificationTitle,
      message: notificationMessage,
      route: `/my-reports?focus=${report.reportCode}`,
      type: "REPORT_MESSAGE",
    });

    emitNotificationCreated({
      userId: reporterNotification.userId,
      notification: reporterNotification,
    });
  }

  emitReportMessageCreated({
    reportId: id,
    reporterUserId: report.reporterUserId,
    sender: message.sender,
    messageId: message.id,
    createdAt: message.createdAt,
  });

  res.status(201).json({ message });
}
