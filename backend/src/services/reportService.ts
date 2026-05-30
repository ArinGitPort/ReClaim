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

export async function listReports(filters: {
  userId?: string;
  status?: ReportStatus;
  statusIn?: ReportStatus[];
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const statusWhere = filters.statusIn && filters.statusIn.length > 0
    ? { in: filters.statusIn }
    : filters.status

  const where = {
    reporterUserId: filters.userId,
    status: statusWhere,
    category: filters.category,
    OR: filters.search
      ? [
          { reportCode: { contains: filters.search, mode: "insensitive" as const } },
          { title: { contains: filters.search, mode: "insensitive" as const } },
          { reporterUser: { name: { contains: filters.search, mode: "insensitive" as const } } },
          { reporterUser: { studentId: { contains: filters.search, mode: "insensitive" as const } } },
        ]
      : undefined,
  }

  const page = filters.page && filters.page > 0 ? filters.page : undefined
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : undefined
  const skip = page && limit ? (page - 1) * limit : undefined

  const [reports, total] = await Promise.all([
    prisma.lostReport.findMany({
      where,
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
                status: "APPROVED",
                pickupToken: { not: null },
              },
              select: {
                pickupToken: true,
                pickupTokenExpires: true,
                claimantUserId: true,
              },
              orderBy: { createdAt: "desc" as const },
              take: 1,
            },
          },
        },
        messages: {
          select: {
            sender: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" as const },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      ...(typeof skip === "number" && typeof limit === "number" ? { skip, take: limit } : {}),
    }),
    prisma.lostReport.count({ where }),
  ])

  return {
    reports,
    total,
    page: page ?? 1,
    limit: limit ?? reports.length,
    pageCount: typeof limit === "number" ? Math.max(1, Math.ceil(total / limit)) : 1,
  }
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

      if (matchedItem.status !== ItemStatus.AVAILABLE && matchedItem.status !== ItemStatus.CLAIM_PENDING) {
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
      status: ReportStatus.CANCELLED,
      matchedItemId: null,
    },
  });
}
