import { AuditAction, ClaimStatus, type Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { decideClaim, listClaims, submitClaim } from "../services/claimService.js";
import { logAudit } from "../services/auditService.js";

const submitClaimSchema = z.object({
  foundItemId: z.string().uuid(),
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
    action: body.status === "APPROVED" ? AuditAction.CLAIM_APPROVED : AuditAction.CLAIM_DENIED,
    targetType: "claim",
    targetId: claim.id,
    description: `Claim updated to ${body.status}`,
    payload: {
      status: claim.status,
      reviewerNote: claim.reviewerNote,
    },
  });

  res.json({ claim });
}
