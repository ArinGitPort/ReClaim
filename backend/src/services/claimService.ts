import { ClaimStatus, ItemStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { createCode, createPickupToken } from "../utils/codes.js";
import { HttpError } from "../utils/errors.js";

export async function submitClaim(input: {
  userId: string;
  foundItemId: string;
  proof: Prisma.InputJsonValue;
}) {
  const item = await prisma.foundItem.findUnique({ where: { id: input.foundItemId } });
  if (!item) {
    throw new HttpError(404, "Found item not found");
  }

  if (item.status !== ItemStatus.AVAILABLE) {
    throw new HttpError(409, "Item is not available for claim");
  }

  const claim = await prisma.claim.create({
    data: {
      claimCode: createCode("CLM"),
      claimantUserId: input.userId,
      foundItemId: input.foundItemId,
      submittedProof: input.proof,
    },
    include: { foundItem: true },
  });

  await prisma.foundItem.update({
    where: { id: input.foundItemId },
    data: { status: ItemStatus.CLAIM_PENDING },
  });

  return claim;
}

export async function listClaims(filters: { status?: ClaimStatus; userId?: string }) {
  return prisma.claim.findMany({
    where: {
      status: filters.status,
      claimantUserId: filters.userId,
    },
    include: {
      foundItem: true,
      claimantUser: {
        select: {
          id: true,
          name: true,
          studentId: true,
          email: true,
        },
      },
      verifiedByAdmin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function decideClaim(input: {
  claimId: string;
  adminId: string;
  status: "APPROVED" | "DENIED" | "INQUIRY_REQUIRED";
  reviewerNote?: string;
}) {
  const claim = await prisma.claim.findUnique({ where: { id: input.claimId }, include: { foundItem: true } });
  if (!claim) {
    throw new HttpError(404, "Claim not found");
  }

  const decisionAtUtc = new Date();
  const approved = input.status === ClaimStatus.APPROVED;

  const updated = await prisma.claim.update({
    where: { id: claim.id },
    data: {
      status: input.status,
      reviewerNote: input.reviewerNote ?? null,
      decisionAtUtc,
      verifiedByAdminId: input.adminId,
      pickupToken: approved ? createPickupToken() : null,
      pickupTokenExpires: approved ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : null,
    },
  });

  await prisma.foundItem.update({
    where: { id: claim.foundItemId },
    data: {
      status: approved ? ItemStatus.CLAIM_PENDING : ItemStatus.AVAILABLE,
    },
  });

  return updated;
}
