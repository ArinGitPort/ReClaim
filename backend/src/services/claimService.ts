import { ClaimStatus, ItemStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { createCode, createPickupToken } from "@/utils/codes.js";
import { HttpError } from "@/utils/errors.js";

const CLAIM_RESERVATION_MS = 1000 * 60 * 60 * 48;
const CLAIM_RETRY_COOLDOWN_MS = 1000 * 60 * 60 * 24;
const reservableClaimStatuses: ClaimStatus[] = [ClaimStatus.PENDING_VERIFICATION, ClaimStatus.INQUIRY_REQUIRED];
const activeClaimStatuses: ClaimStatus[] = [ClaimStatus.PENDING_VERIFICATION, ClaimStatus.INQUIRY_REQUIRED, ClaimStatus.APPROVED];

type ClaimTransaction = Prisma.TransactionClient;

async function releaseItemIfNoActiveHold(tx: ClaimTransaction, foundItemId: string, now = new Date()): Promise<void> {
  const activeHold = await tx.claim.findFirst({
    where: {
      foundItemId,
      status: { in: activeClaimStatuses },
      OR: [
        { status: ClaimStatus.APPROVED },
        { reservationExpiresAt: null },
        { reservationExpiresAt: { gt: now } },
      ],
    },
    select: { id: true },
  });

  if (!activeHold) {
    await tx.foundItem.update({
      where: { id: foundItemId },
      data: { status: ItemStatus.AVAILABLE },
    });
  }
}

export async function expireStaleClaimReservations(now = new Date()): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const staleClaims = await tx.claim.findMany({
      where: {
        status: { in: reservableClaimStatuses },
        reservationExpiresAt: { lte: now },
      },
      select: {
        id: true,
        foundItemId: true,
      },
    });

    if (staleClaims.length === 0) {
      return;
    }

    await tx.claim.updateMany({
      where: {
        id: { in: staleClaims.map((claim) => claim.id) },
      },
      data: {
        status: ClaimStatus.EXPIRED,
        reviewerNote: "Reservation expired before review",
        pickupToken: null,
        pickupTokenExpires: null,
      },
    });

    const itemIds = Array.from(new Set(staleClaims.map((claim) => claim.foundItemId)));
    await Promise.all(itemIds.map((itemId) => releaseItemIfNoActiveHold(tx, itemId, now)));
  });
}

export async function submitClaim(input: {
  userId: string;
  foundItemId: string;
  proof: Prisma.InputJsonValue;
}) {
  const now = new Date();
  await expireStaleClaimReservations(now);

  const claim = await prisma.$transaction(async (tx) => {
    const item = await tx.foundItem.findUnique({ where: { id: input.foundItemId } });
    if (!item) {
      throw new HttpError(404, "Found item not found");
    }

    if (item.status !== ItemStatus.AVAILABLE) {
      throw new HttpError(409, "Item is not available for claim");
    }

    const activeHold = await tx.claim.findFirst({
      where: {
        foundItemId: input.foundItemId,
        status: { in: activeClaimStatuses },
        OR: [
          { status: ClaimStatus.APPROVED },
          { reservationExpiresAt: null },
          { reservationExpiresAt: { gt: now } },
        ],
      },
      select: { id: true },
    });

    if (activeHold) {
      throw new HttpError(409, "Item is temporarily reserved by an active claim");
    }

    const recentClosedClaim = await tx.claim.findFirst({
      where: {
        claimantUserId: input.userId,
        foundItemId: input.foundItemId,
        status: { in: [ClaimStatus.EXPIRED, ClaimStatus.CANCELLED] },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        status: true,
        updatedAt: true,
        reservationExpiresAt: true,
      },
    });

    if (recentClosedClaim) {
      const cooldownStart = recentClosedClaim.status === ClaimStatus.EXPIRED
        ? (recentClosedClaim.reservationExpiresAt ?? recentClosedClaim.updatedAt)
        : recentClosedClaim.updatedAt;
      const availableAt = new Date(cooldownStart.getTime() + CLAIM_RETRY_COOLDOWN_MS);
      if (availableAt.getTime() > now.getTime()) {
        throw new HttpError(409, "You can claim this item again after the cooldown ends.", {
          code: "CLAIM_RETRY_COOLDOWN",
          availableAt,
        });
      }
    }

    const createdClaim = await tx.claim.create({
      data: {
        claimCode: createCode("CLM"),
        claimantUserId: input.userId,
        foundItemId: input.foundItemId,
        submittedProof: input.proof,
        reservationExpiresAt: new Date(now.getTime() + CLAIM_RESERVATION_MS),
      },
      include: { foundItem: true },
    });

    await tx.foundItem.update({
      where: { id: input.foundItemId },
      data: { status: ItemStatus.CLAIM_PENDING },
    });

    return createdClaim;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  return claim;
}

export async function listClaims(filters: { status?: ClaimStatus; statusIn?: ClaimStatus[]; userId?: string }) {
  await expireStaleClaimReservations();

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
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          sender: true,
          createdAt: true,
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
  await expireStaleClaimReservations();

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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            sender: true,
            createdAt: true,
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
  await expireStaleClaimReservations();

  const claim = await prisma.claim.findUnique({ where: { id: input.claimId }, include: { foundItem: true } });
  if (!claim) {
    throw new HttpError(404, "Claim not found");
  }

  if (claim.status === ClaimStatus.EXPIRED) {
    throw new HttpError(400, "Claim reservation has expired");
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
      reservationExpiresAt: approved ? null : claim.reservationExpiresAt,
      decisionAtUtc,
      verifiedByAdminId: input.adminId,
      pickupToken: approved ? createPickupToken() : null,
      pickupTokenExpires: approved ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : null,
    },
  });

  await prisma.foundItem.update({
    where: { id: claim.foundItemId },
    data: {
      status: input.status === ClaimStatus.DENIED ? ItemStatus.AVAILABLE : ItemStatus.CLAIM_PENDING,
    },
  });

  return updated;
}

export async function updateClaimProof(input: {
  claimId: string;
  userId: string;
  proof: Prisma.InputJsonValue;
}) {
  await expireStaleClaimReservations();

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
  await expireStaleClaimReservations();

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
    claim.status === ClaimStatus.CANCELLED ||
    claim.status === ClaimStatus.EXPIRED
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
    await prisma.$transaction(async (tx) => {
      await releaseItemIfNoActiveHold(tx, claim.foundItemId);
    });
  }

  return updated;
}
