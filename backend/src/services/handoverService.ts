import { ClaimStatus, ItemStatus, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { HttpError } from "@/utils/errors.js";

export async function listHandoverLogs(filters: {
  search?: string;
  source?: "CLAIM" | "REPORT_MATCH";
  page?: number;
  limit?: number;
}) {
  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);

  const where = {
    ...(filters.source === "CLAIM"
      ? { claimId: { not: null } }
      : filters.source === "REPORT_MATCH"
        ? { claimId: null }
        : {}),
    OR: filters.search
      ? [
          { pickupTokenPresented: { contains: filters.search, mode: "insensitive" as const } },
          { note: { contains: filters.search, mode: "insensitive" as const } },
          { claim: { claimCode: { contains: filters.search, mode: "insensitive" as const } } },
          { foundItem: { code: { contains: filters.search, mode: "insensitive" as const } } },
          { foundItem: { title: { contains: filters.search, mode: "insensitive" as const } } },
          { releasedToUser: { name: { contains: filters.search, mode: "insensitive" as const } } },
          { releasedToUser: { studentId: { contains: filters.search, mode: "insensitive" as const } } },
        ]
      : undefined,
  };

  const [handovers, total] = await Promise.all([
    prisma.handoverLog.findMany({
      where,
      include: {
        claim: {
          select: {
            id: true,
            claimCode: true,
          },
        },
        foundItem: {
          select: {
            id: true,
            code: true,
            title: true,
            category: true,
            status: true,
            storageLocation: true,
          },
        },
        releasedToUser: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
          },
        },
      },
      orderBy: { releasedAtUtc: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.handoverLog.count({ where }),
  ]);

  return {
    handovers,
    total,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function createHandoverLog(input: {
  foundItemId: string;
  claimId?: string;
  releasedToUserId: string;
  pickupTokenPresented: string;
  idVerified: boolean;
  note?: string;
}) {
  const item = await prisma.foundItem.findUnique({ where: { id: input.foundItemId } });
  if (!item) {
    throw new HttpError(404, "Found item not found");
  }

  const handover = await prisma.handoverLog.create({
    data: {
      foundItemId: input.foundItemId,
      claimId: input.claimId,
      releasedToUserId: input.releasedToUserId,
      pickupTokenPresented: input.pickupTokenPresented,
      idVerified: input.idVerified,
      releasedAtUtc: new Date(),
      note: input.note,
    },
  });

  await prisma.foundItem.update({
    where: { id: input.foundItemId },
    data: {
      status: ItemStatus.RETURNED,
    },
  });

  return handover;
}

export async function getHandoverPreviewByToken(input: { pickupToken: string }) {
  const claim = await prisma.claim.findFirst({
    where: {
      pickupToken: input.pickupToken,
      status: ClaimStatus.APPROVED,
    },
    include: {
      claimantUser: {
        select: {
          id: true,
          name: true,
          studentId: true,
          email: true,
        },
      },
      foundItem: {
        select: {
          id: true,
          code: true,
          title: true,
          category: true,
          storageLocation: true,
          status: true,
        },
      },
    },
  });

  if (!claim) {
    throw new HttpError(404, "Pickup token not found or not eligible for handover");
  }

  if (claim.pickupTokenExpires && claim.pickupTokenExpires < new Date()) {
    throw new HttpError(410, "Pickup token has expired");
  }

  if (claim.foundItem.status === ItemStatus.RETURNED) {
    throw new HttpError(409, "Item was already handed over");
  }

  return {
    claimId: claim.id,
    claimCode: claim.claimCode,
    pickupToken: claim.pickupToken,
    pickupTokenExpires: claim.pickupTokenExpires,
    student: {
      id: claim.claimantUser.id,
      name: claim.claimantUser.name,
      studentId: claim.claimantUser.studentId,
      email: claim.claimantUser.email,
    },
    item: {
      id: claim.foundItem.id,
      code: claim.foundItem.code,
      title: claim.foundItem.title,
      category: claim.foundItem.category,
      storageLocation: claim.foundItem.storageLocation ?? "Unassigned",
      status: claim.foundItem.status,
    },
  };
}

export async function confirmHandoverByToken(input: {
  pickupToken: string;
  idVerified: boolean;
  note?: string;
}) {
  if (!input.idVerified) {
    throw new HttpError(400, "ID verification must be confirmed before handover");
  }

  return prisma.$transaction(async (tx) => {
    const claim = await tx.claim.findFirst({
      where: {
        pickupToken: input.pickupToken,
        status: ClaimStatus.APPROVED,
      },
      include: {
        foundItem: true,
      },
    });

    if (!claim) {
      throw new HttpError(404, "Pickup token not found or not eligible for handover");
    }

    if (claim.pickupTokenExpires && claim.pickupTokenExpires < new Date()) {
      throw new HttpError(410, "Pickup token has expired");
    }

    if (claim.foundItem.status === ItemStatus.RETURNED) {
      throw new HttpError(409, "Item was already handed over");
    }

    const linkedReport = await tx.lostReport.findFirst({
      where: {
        matchedItemId: claim.foundItemId,
        reporterUserId: claim.claimantUserId,
        status: {
          in: [ReportStatus.MATCHED, ReportStatus.ACTIVE_SEARCH],
        },
      },
    });

    const handover = await tx.handoverLog.create({
      data: {
        foundItemId: claim.foundItemId,
        claimId: claim.id,
        releasedToUserId: claim.claimantUserId,
        pickupTokenPresented: input.pickupToken,
        idVerified: true,
        releasedAtUtc: new Date(),
        note: input.note,
      },
    });

    await tx.foundItem.update({
      where: { id: claim.foundItemId },
      data: { status: ItemStatus.RETURNED },
    });

    const resolvedReport = linkedReport
      ? await tx.lostReport.update({
          where: { id: linkedReport.id },
          data: { status: ReportStatus.RESOLVED },
        })
      : null;

    return {
      handover,
      claim,
      resolvedReport,
    };
  });
}

export async function cancelHandoverByToken(input: { pickupToken: string }) {
  const claim = await prisma.claim.findFirst({
    where: {
      pickupToken: input.pickupToken,
      status: ClaimStatus.APPROVED,
    },
  });

  if (!claim) {
    throw new HttpError(404, "Pickup token not found or not eligible for cancellation");
  }

  return prisma.$transaction(async (tx) => {
    const updatedClaim = await tx.claim.update({
      where: { id: claim.id },
      data: {
        status: ClaimStatus.CANCELLED,
        pickupToken: null,
        pickupTokenExpires: null,
        reviewerNote: "Handover cancelled by admin",
      },
    });

    await tx.foundItem.update({
      where: { id: claim.foundItemId },
      data: { status: ItemStatus.AVAILABLE },
    });

    return updatedClaim;
  });
}

export async function restoreHandover(input: { handoverId: string }) {
  const handover = await prisma.handoverLog.findUnique({
    where: { id: input.handoverId },
    include: {
      claim: true,
    },
  });

  if (!handover) {
    throw new HttpError(404, "Handover log not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.handoverLog.delete({
      where: { id: handover.id },
    });

    const restoredClaim = handover.claimId
      ? await tx.claim.update({
          where: { id: handover.claimId },
          data: {
            status: ClaimStatus.CANCELLED,
            pickupToken: null,
            pickupTokenExpires: null,
            reviewerNote: "Handover restored by admin; previous approved claim was cancelled",
          },
        })
      : null;

    await tx.foundItem.update({
      where: { id: handover.foundItemId },
      data: { status: ItemStatus.AVAILABLE },
    });

    return {
      success: true,
      foundItemId: handover.foundItemId,
      restoredClaim,
      releasedToUserId: handover.releasedToUserId,
    };
  });
}
