import { AuditAction, ClaimStatus, type Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { closeClaimByStudent, decideClaim, listClaims, listClaimsPaginated, submitClaim, updateClaimProof } from "@/services/claimService.js";
import { logAudit } from "@/services/auditService.js";
import { HttpError } from "@/utils/errors.js";
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

const submitClaimSchema = z.object({
  foundItemId: z.string().uuid(),
  proof: z.record(z.string(), z.unknown()),
});

const updateProofSchema = z.object({
  proof: z.record(z.string(), z.unknown()),
});

const decisionSchema = z.object({
  status: z.enum(["APPROVED", "DENIED", "INQUIRY_REQUIRED"]),
  reviewerNote: z.string().optional(),
});

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function postClaim(req: Request, res: Response): Promise<void> {
  const body = submitClaimSchema.parse(req.body);

  const claim = await submitClaim({
    userId: req.user!.id,
    foundItemId: body.foundItemId,
    proof: body.proof as Prisma.InputJsonValue,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.CLAIM_SUBMITTED,
    targetType: "claim",
    targetId: claim.id,
    description: "Student submitted a claim",
    targetReferenceCode: claim.claimCode,
    payload: {
      targetReferenceCode: claim.claimCode,
      claimCode: claim.claimCode,
      foundItemId: claim.foundItemId,
    },
  });

  const adminNotifications = await createNotificationsForRoles({
    roles: ["ADMIN", "STAFF"],
    title: "New Claim Submitted",
    message: `${claim.claimCode} requires verification review.`,
    route: "/admin/claims",
  });

  adminNotifications.forEach((notification: NotificationPayload) => {
    emitNotificationCreated({
      userId: notification.userId,
      notification,
    });
  });

  emitItemUpdated({
    itemId: claim.foundItemId,
    status: "CLAIM_PENDING",
  });

  res.status(201).json({ claim });
}

export async function getClaims(req: Request, res: Response): Promise<void> {
  const statusQuery = typeof req.query.status === "string" ? req.query.status : undefined;
  const statusInQuery = typeof req.query.statusIn === "string" ? req.query.statusIn : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const pageQuery = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limitQuery = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const status = statusQuery && Object.values(ClaimStatus).includes(statusQuery as ClaimStatus)
    ? (statusQuery as ClaimStatus)
    : undefined;

  const statusIn = statusInQuery
    ? statusInQuery
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is ClaimStatus => Object.values(ClaimStatus).includes(value as ClaimStatus))
    : undefined;

  const userScoped = req.user?.role === "STUDENT" ? req.user.id : undefined;

  if (req.user?.role === "STUDENT") {
    const claims = await listClaims({ status, statusIn, userId: userScoped });
    res.json({ claims });
    return;
  }

  const page = Number.isFinite(pageQuery) && (pageQuery as number) > 0 ? (pageQuery as number) : 1;
  const limit = Number.isFinite(limitQuery) && (limitQuery as number) > 0 ? Math.min(limitQuery as number, 100) : 25;
  const result = await listClaimsPaginated({
    status,
    statusIn,
    search: search || undefined,
    page,
    limit,
  });

  res.json({
    claims: result.claims,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pageCount: result.pageCount,
    },
  });
}

export async function patchClaimDecision(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = decisionSchema.parse(req.body);

  const previous = await prisma.claim.findUnique({
    where: { id },
    select: {
      status: true,
      reviewerNote: true,
      claimCode: true,
    },
  });

  if (!previous) {
    throw new HttpError(404, "Claim not found");
  }

  const claim = await decideClaim({
    claimId: id,
    adminId: req.user!.id,
    status: body.status,
    reviewerNote: body.reviewerNote,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: body.status === "APPROVED"
      ? AuditAction.CLAIM_APPROVED
      : body.status === "DENIED"
        ? AuditAction.CLAIM_DENIED
        : AuditAction.CLAIM_REVIEWED,
    targetType: "claim",
    targetId: claim.id,
    description: `Claim updated to ${body.status}`,
    targetReferenceCode: claim.claimCode,
    payload: {
      targetReferenceCode: claim.claimCode,
      changes: [
        {
          changedField: "status",
          oldValue: previous.status,
          newValue: claim.status,
        },
        {
          changedField: "reviewerNote",
          oldValue: previous.reviewerNote ?? null,
          newValue: claim.reviewerNote ?? null,
        },
      ].filter((change) => change.oldValue !== change.newValue),
      before: {
        status: previous.status,
        reviewerNote: previous.reviewerNote,
      },
      after: {
        status: claim.status,
        reviewerNote: claim.reviewerNote,
      },
    },
  });

  const claimantNotification = await createNotificationForUser({
    userId: claim.claimantUserId,
    title: "Claim Status Updated",
    message: `${claim.claimCode} is now ${claim.status.replaceAll("_", " ")}.`,
    route: claim.status === "APPROVED" ? "/ready-to-claim" : "/my-claims",
  });

  emitNotificationCreated({
    userId: claimantNotification.userId,
    notification: claimantNotification,
  });

  emitItemUpdated({
    itemId: claim.foundItemId,
    status: claim.status === "DENIED" ? "AVAILABLE" : "CLAIM_PENDING",
  });

  res.json({ claim });
}

export async function patchClaimProof(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = updateProofSchema.parse(req.body);

  const previous = await prisma.claim.findUnique({
    where: { id },
    select: {
      status: true,
      claimCode: true,
    },
  });

  if (!previous) {
    throw new HttpError(404, "Claim not found");
  }

  const claim = await updateClaimProof({
    claimId: id,
    userId: req.user!.id,
    proof: body.proof as Prisma.InputJsonValue,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.CLAIM_REVIEWED,
    targetType: "claim",
    targetId: claim.id,
    description: "Student submitted additional proof for inquiry",
    targetReferenceCode: claim.claimCode,
    payload: {
      targetReferenceCode: claim.claimCode,
      changes: [
        {
          changedField: "status",
          oldValue: previous.status,
          newValue: claim.status,
        },
      ],
      before: {
        status: previous.status,
      },
      after: {
        status: claim.status,
      },
    },
  });

  const adminNotifications = await createNotificationsForRoles({
    roles: ["ADMIN", "STAFF"],
    title: "Claim Proof Updated",
    message: `${claim.claimCode} has updated proof and is back in queue.`,
    route: "/admin/claims",
  });

  adminNotifications.forEach((notification: NotificationPayload) => {
    emitNotificationCreated({
      userId: notification.userId,
      notification,
    });
  });

  res.json({ claim });
}

export async function patchClaimClose(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);

  const previous = await prisma.claim.findUnique({
    where: { id },
    select: {
      status: true,
      claimCode: true,
    },
  });

  if (!previous) {
    throw new HttpError(404, "Claim not found");
  }

  const claim = await closeClaimByStudent({
    claimId: id,
    userId: req.user!.id,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.CLAIM_REVIEWED,
    targetType: "claim",
    targetId: claim.id,
    description: "Student closed claim ticket",
    targetReferenceCode: claim.claimCode,
    payload: {
      targetReferenceCode: claim.claimCode,
      changes: [
        {
          changedField: "status",
          oldValue: previous.status,
          newValue: claim.status,
        },
      ],
      before: {
        status: previous.status,
      },
      after: {
        status: claim.status,
      },
    },
  });

  const adminNotifications = await createNotificationsForRoles({
    roles: ["ADMIN", "STAFF"],
    title: "Claim Closed by Student",
    message: `${claim.claimCode} was closed by the claimant.`,
    route: "/admin/claims",
  });

  adminNotifications.forEach((notification: NotificationPayload) => {
    emitNotificationCreated({
      userId: notification.userId,
      notification,
    });
  });

  emitItemUpdated({
    itemId: claim.foundItemId,
    status: "AVAILABLE",
  });

  res.json({ claim });
}
