import { ClaimStatus, ItemStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { createCode, createPickupToken } from "@/utils/codes.js";
import { HttpError } from "@/utils/errors.js";

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

  return claim;
}

export async function listClaims(filters: { status?: ClaimStatus; statusIn?: ClaimStatus[]; userId?: string }) {
  return prisma.claim.findMany({
    where: {
        status: filters.statusIn && filters.statusIn.length > 0
          ? { in: filters.statusIn }
          : filters.status,
      claimantUserId: filters.userId,
    },
    include: {
      foundItem: {
        include: {
          aiEvidenceLogs: true,
        },
      },
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

export async function listClaimsPaginated(filters: {
  status?: ClaimStatus;
  statusIn?: ClaimStatus[];
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);

  const where: Prisma.ClaimWhereInput = {
    status: filters.statusIn && filters.statusIn.length > 0
      ? { in: filters.statusIn }
      : filters.status,
    claimantUserId: filters.userId,
    OR: filters.search
      ? [
          { claimCode: { contains: filters.search, mode: "insensitive" as const } },
          { foundItem: { title: { contains: filters.search, mode: "insensitive" as const } } },
          { foundItem: { code: { contains: filters.search, mode: "insensitive" as const } } },
          { claimantUser: { name: { contains: filters.search, mode: "insensitive" as const } } },
          { claimantUser: { studentId: { contains: filters.search, mode: "insensitive" as const } } },
        ]
      : undefined,
  };

  const [claims, total] = await Promise.all([
    prisma.claim.findMany({
      where,
      include: {
        foundItem: {
          include: {
            aiEvidenceLogs: true,
          },
        },
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
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.claim.count({ where }),
  ]);

  return {
    claims,
    total,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
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

  if (claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.DENIED) {
    throw new HttpError(400, "Claim has already been finalized");
  }

  const note = input.reviewerNote?.trim();
  if ((input.status === ClaimStatus.DENIED || input.status === ClaimStatus.INQUIRY_REQUIRED) && !note) {
    throw new HttpError(400, "reviewerNote is required for deny or inquiry decisions");
  }

  const decisionAtUtc = new Date();
  const approved = input.status === ClaimStatus.APPROVED;

  const updated = await prisma.claim.update({
    where: { id: claim.id },
    data: {
      status: input.status,
      reviewerNote: note ?? null,
      decisionAtUtc,
      verifiedByAdminId: input.adminId,
      pickupToken: approved ? createPickupToken() : null,
      pickupTokenExpires: approved ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : null,
    },
  });

  await prisma.foundItem.update({
    where: { id: claim.foundItemId },
    data: {
      status: input.status === ClaimStatus.APPROVED ? ItemStatus.CLAIM_PENDING : ItemStatus.AVAILABLE,
    },
  });

  return updated;
}

export async function updateClaimProof(input: {
  claimId: string;
  userId: string;
  proof: Prisma.InputJsonValue;
}) {
  const claim = await prisma.claim.findUnique({ where: { id: input.claimId } });
  if (!claim) {
    throw new HttpError(404, "Claim not found");
  }

  if (claim.claimantUserId !== input.userId) {
    throw new HttpError(403, "You can only update your own claim");
  }

  if (claim.status !== ClaimStatus.INQUIRY_REQUIRED) {
    throw new HttpError(400, "Only inquiry-required claims can be updated with additional proof");
  }

  return prisma.claim.update({
    where: { id: claim.id },
    data: {
      submittedProof: input.proof,
      status: ClaimStatus.PENDING_VERIFICATION,
      reviewerNote: null,
      decisionAtUtc: null,
      verifiedByAdminId: null,
      pickupToken: null,
      pickupTokenExpires: null,
    },
  });
}

export async function closeClaimByStudent(input: {
  claimId: string;
  userId: string;
}) {
  const claim = await prisma.claim.findUnique({ where: { id: input.claimId }, include: { foundItem: true } });
  if (!claim) {
    throw new HttpError(404, "Claim not found");
  }

  if (claim.claimantUserId !== input.userId) {
    throw new HttpError(403, "You can only close your own claim");
  }

  if (
    claim.status === ClaimStatus.APPROVED ||
    claim.status === ClaimStatus.DENIED ||
    claim.status === ClaimStatus.CANCELLED
  ) {
    throw new HttpError(400, "This claim can no longer be closed");
  }

  const updated = await prisma.claim.update({
    where: { id: claim.id },
    data: {
      status: ClaimStatus.CANCELLED,
      reviewerNote: "Closed by claimant",
      decisionAtUtc: null,
      verifiedByAdminId: null,
      pickupToken: null,
      pickupTokenExpires: null,
    },
  });

  if (claim.foundItem.status === ItemStatus.CLAIM_PENDING) {
    await prisma.foundItem.update({
      where: { id: claim.foundItemId },
      data: { status: ItemStatus.AVAILABLE },
    });
  }

  return updated;
}
