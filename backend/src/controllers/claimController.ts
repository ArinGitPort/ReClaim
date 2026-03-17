import { AuditAction, ClaimStatus, type Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { decideClaim, listClaims, submitClaim, updateClaimProof } from "../services/claimService.js";
import { logAudit } from "../services/auditService.js";
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
    payload: {
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

  res.status(201).json({ claim });
}

export async function getClaims(req: Request, res: Response): Promise<void> {
  const statusQuery = typeof req.query.status === "string" ? req.query.status : undefined;
  const status = statusQuery && Object.values(ClaimStatus).includes(statusQuery as ClaimStatus)
    ? (statusQuery as ClaimStatus)
    : undefined;

  const userScoped = req.user?.role === "STUDENT" ? req.user.id : undefined;
  const claims = await listClaims({ status, userId: userScoped });
  res.json({ claims });
}

export async function patchClaimDecision(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = decisionSchema.parse(req.body);
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
    payload: {
      status: claim.status,
      reviewerNote: claim.reviewerNote,
    },
  });

  const claimantNotification = await createNotificationForUser({
    userId: claim.claimantUserId,
    title: "Claim Status Updated",
    message: `${claim.claimCode} is now ${claim.status.replaceAll("_", " ")}.`,
    route: "/my-claims",
  });

  emitNotificationCreated({
    userId: claimantNotification.userId,
    notification: claimantNotification,
  });

  res.json({ claim });
}

export async function patchClaimProof(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = updateProofSchema.parse(req.body);

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
    payload: {
      status: claim.status,
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
