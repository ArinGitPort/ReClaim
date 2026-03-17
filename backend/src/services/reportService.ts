import { ReportStatus, type Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { createCode } from "../utils/codes.js";
import { HttpError } from "../utils/errors.js";

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
    },
  });
}

export async function listReports(filters: { userId?: string; status?: ReportStatus }) {
  return prisma.lostReport.findMany({
    where: {
      reporterUserId: filters.userId,
      status: filters.status,
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

  return prisma.lostReport.update({
    where: { id: input.reportId },
    data: {
      status: input.status,
      matchedItemId: input.matchedItemId,
    },
  });
}
