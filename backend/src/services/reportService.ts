import { ClaimStatus, ItemStatus, Prisma, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { createCode, createPickupToken } from "@/utils/codes.js";
import { HttpError } from "@/utils/errors.js";

export async function submitLostReport(input: {
  userId: string;
  title: string;
  category: string;
  color: string;
  location: string;
  reportedLostAtUtc: Date;
  timeWindow?: string;
  proofData: Prisma.InputJsonValue;
}) {
  return prisma.lostReport.create({
    data: {
      reportCode: createCode("REP"),
      reporterUserId: input.userId,
      title: input.title,
      category: input.category,
      color: input.color,
      location: input.location,
      reportedLostAtUtc: input.reportedLostAtUtc,
      timeWindow: input.timeWindow,
      proofData: input.proofData,
      status: ReportStatus.UNDER_REVIEW,
    },
  });
}

export async function listReports(filters: { userId?: string; status?: ReportStatus; statusIn?: ReportStatus[] }) {
  const statusWhere = filters.statusIn && filters.statusIn.length > 0
    ? { in: filters.statusIn }
    : filters.status

  if (filters.userId) {
    const studentReports = await prisma.lostReport.findMany({
      where: {
        reporterUserId: filters.userId,
        status: statusWhere,
      },
      include: {
        reporterUser: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
          },
        },
        matchedItem: {
          include: {
            claims: {
              where: {
                claimantUserId: filters.userId,
                status: ClaimStatus.APPROVED,
              },
              select: {
                id: true,
                claimCode: true,
                pickupToken: true,
                pickupTokenExpires: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return studentReports.map((report) => ({
      ...report,
      pickupClaim: report.matchedItem?.claims?.[0] ?? null,
    }));
  }

  return prisma.lostReport.findMany({
    where: {
      reporterUserId: filters.userId,
      status: statusWhere,
    },
    include: {
      reporterUser: {
        select: {
          id: true,
          name: true,
          studentId: true,
          email: true,
        },
      },
      matchedItem: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateReportStatus(input: {
  reportId: string;
  status: ReportStatus;
  matchedItemId?: string;
  adminId: string;
}) {
  const report = await prisma.lostReport.findUnique({ where: { id: input.reportId } });
  if (!report) {
    throw new HttpError(404, "Lost report not found");
  }

  if (
    input.status === ReportStatus.ACTIVE_SEARCH &&
    report.status !== ReportStatus.SUBMITTED &&
    report.status !== ReportStatus.UNDER_REVIEW
  ) {
    throw new HttpError(400, "Only submitted or under-review reports can be authorized for active search");
  }

  if (
    report.status === ReportStatus.REJECTED ||
    report.status === ReportStatus.RESOLVED
  ) {
    throw new HttpError(400, "Cannot update a finalized report");
  }

  if (input.status === ReportStatus.MATCHED) {
    if (!input.matchedItemId) {
      throw new HttpError(400, "matchedItemId is required when marking report as matched");
    }

    if (report.status !== ReportStatus.ACTIVE_SEARCH) {
      throw new HttpError(400, "Only active-search reports can be marked as match found");
    }

    const matchedItemId = input.matchedItemId;

    return prisma.$transaction(async (tx) => {
      const matchedItem = await tx.foundItem.findUnique({ where: { id: matchedItemId } });
      if (!matchedItem) {
        throw new HttpError(404, "Matched found item not found");
      }

      if (matchedItem.status !== ItemStatus.AVAILABLE) {
        throw new HttpError(409, "Found item is no longer available for matching");
      }

      const now = new Date();
      const updatedReport = await tx.lostReport.update({
        where: { id: input.reportId },
        data: {
          status: ReportStatus.MATCHED,
          matchedItemId,
        },
      });

      await tx.foundItem.update({
        where: { id: matchedItemId },
        data: {
          status: ItemStatus.CLAIM_PENDING,
        },
      });

      const existingClaim = await tx.claim.findFirst({
        where: {
          foundItemId: matchedItemId,
          claimantUserId: report.reporterUserId,
          status: ClaimStatus.APPROVED,
        },
        orderBy: { createdAt: "desc" },
      });

      const claim = existingClaim ?? await tx.claim.create({
        data: {
          claimCode: createCode("CLM"),
          foundItemId: matchedItemId,
          claimantUserId: report.reporterUserId,
          submittedProof: report.proofData === null ? Prisma.JsonNull : (report.proofData as Prisma.InputJsonValue),
          status: ClaimStatus.APPROVED,
          reviewerNote: "Auto-approved from lost-report matching workflow",
          decisionAtUtc: now,
          verifiedByAdminId: input.adminId,
          pickupToken: createPickupToken(),
          pickupTokenExpires: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3),
        },
      });

      return {
        ...updatedReport,
        pickupToken: claim.pickupToken,
        pickupTokenExpires: claim.pickupTokenExpires,
      };
    });
  }

  return prisma.lostReport.update({
    where: { id: input.reportId },
    data: {
      status: input.status,
      matchedItemId: input.matchedItemId,
    },
  });
}

export async function closeReportByStudent(input: {
  reportId: string;
  userId: string;
}) {
  const report = await prisma.lostReport.findUnique({ where: { id: input.reportId } });
  if (!report) {
    throw new HttpError(404, "Lost report not found");
  }

  if (report.reporterUserId !== input.userId) {
    throw new HttpError(403, "You can only close your own report");
  }

  if (
    report.status === ReportStatus.REJECTED ||
    report.status === ReportStatus.RESOLVED ||
    report.status === ReportStatus.MATCHED
  ) {
    throw new HttpError(400, "This report can no longer be closed");
  }

  return prisma.lostReport.update({
    where: { id: report.id },
    data: {
      status: ReportStatus.RESOLVED,
      matchedItemId: null,
    },
  });
}
