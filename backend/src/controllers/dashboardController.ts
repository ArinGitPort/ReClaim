import type { Request, Response, NextFunction } from "express";
import { ClaimStatus, ItemStatus, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { getSystemSettings } from "@/services/settingsService.js";

export const getDashboardMetrics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Available Inventory
    const activeInventory = await prisma.foundItem.count({
      where: { status: "AVAILABLE" }
    });

    // 2. Pending Claims
    const pendingClaims = await prisma.claim.count({
      where: { status: "PENDING_VERIFICATION" }
    });

    // 3. Active Searches
    const activeSearches = await prisma.lostReport.count({
      where: { status: "ACTIVE_SEARCH" }
    });

    // 4. Active Cameras (fallback to 4 if no evidence logs yet)
    const distinctCameras = await prisma.aIEvidenceLog.groupBy({
      by: ["sourceCameraId"]
    });
    const activeCameras = distinctCameras.length > 0 ? distinctCameras.length : 4;

    // 5. Inventory breakdown by status
    const [availableCount, claimPendingCount, returnedCount, archivedCount] =
      await Promise.all([
        prisma.foundItem.count({ where: { status: "AVAILABLE" } }),
        prisma.foundItem.count({ where: { status: "CLAIM_PENDING" } }),
        prisma.foundItem.count({ where: { status: "RETURNED" } }),
        prisma.foundItem.count({ where: { status: "ARCHIVED" } }),
      ]);

    // 6. Claims requiring inquiry (INQUIRY_REQUIRED)
    const inquiryClaims = await prisma.claim.findMany({
      where: { status: "INQUIRY_REQUIRED" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        claimantUser: { select: { name: true, email: true } },
        foundItem: { select: { code: true, title: true } },
      },
    });

    // 7. Lost report breakdown by status
    const [
      reportsSubmitted,
      reportsUnderReview,
      reportsActiveSearch,
      reportsMatched,
      reportsResolved,
      reportsRejected,
    ] = await Promise.all([
      prisma.lostReport.count({ where: { status: "SUBMITTED" } }),
      prisma.lostReport.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.lostReport.count({ where: { status: "ACTIVE_SEARCH" } }),
      prisma.lostReport.count({ where: { status: "MATCHED" } }),
      prisma.lostReport.count({ where: { status: "RESOLVED" } }),
      prisma.lostReport.count({ where: { status: "REJECTED" } }),
    ]);

    // 8. Recent Matches Alert
    const recentMatches = await prisma.lostReport.findMany({
      where: { status: "MATCHED" },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        reporterUser: { select: { name: true, email: true } },
        matchedItem: { select: { code: true } }
      }
    });

    // 8. Recent Activity Feed
    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        actorUser: { select: { name: true, role: true } }
      }
    });

    res.json({
      metrics: {
        activeInventory,
        pendingClaims,
        activeSearches,
        activeCameras
      },
      inventoryBreakdown: {
        available: availableCount,
        claimPending: claimPendingCount,
        returned: returnedCount,
        archived: archivedCount,
      },
      lostReportBreakdown: {
        submitted: reportsSubmitted,
        underReview: reportsUnderReview,
        activeSearch: reportsActiveSearch,
        matched: reportsMatched,
        resolved: reportsResolved,
        rejected: reportsRejected,
      },
      inquiryClaims,
      recentMatches,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

export const getOperationsSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const settings = await getSystemSettings();
    const retentionDays = settings.retentionPolicy.foundItemRetentionDays;
    const expiredCutoff = new Date(now.getTime() - retentionDays * DAY_MS);
    const nearExpiryCutoff = new Date(now.getTime() - Math.max(retentionDays - 7, 1) * DAY_MS);
    const reservationWarningCutoff = new Date(now.getTime() + 12 * HOUR_MS);
    const pickupWarningCutoff = new Date(now.getTime() + 24 * HOUR_MS);
    const staleReportCutoff = new Date(now.getTime() - 7 * DAY_MS);
    const staleSnapshotCutoff = new Date(now.getTime() - 24 * HOUR_MS);

    const [
      pendingClaims,
      pendingClaimsCount,
      inquiryClaims,
      inquiryClaimsCount,
      approvedPickups,
      approvedPickupsCount,
      activeReports,
      activeReportsCount,
      pendingSnapshots,
      pendingSnapshotsCount,
      expiredInventory,
      expiredInventoryCount,
      nearRetentionCount,
    ] = await Promise.all([
      prisma.claim.findMany({
        where: { status: ClaimStatus.PENDING_VERIFICATION },
        orderBy: [{ reservationExpiresAt: "asc" }, { createdAt: "asc" }],
        take: 6,
        include: {
          claimantUser: { select: { name: true, email: true } },
          foundItem: { select: { code: true, title: true, category: true } },
        },
      }),
      prisma.claim.count({ where: { status: ClaimStatus.PENDING_VERIFICATION } }),
      prisma.claim.findMany({
        where: { status: ClaimStatus.INQUIRY_REQUIRED },
        orderBy: [{ reservationExpiresAt: "asc" }, { updatedAt: "asc" }],
        take: 6,
        include: {
          claimantUser: { select: { name: true, email: true } },
          foundItem: { select: { code: true, title: true, category: true } },
        },
      }),
      prisma.claim.count({ where: { status: ClaimStatus.INQUIRY_REQUIRED } }),
      prisma.claim.findMany({
        where: {
          status: ClaimStatus.APPROVED,
          foundItem: { status: { not: ItemStatus.RETURNED } },
        },
        orderBy: [{ pickupTokenExpires: "asc" }, { updatedAt: "asc" }],
        take: 6,
        include: {
          claimantUser: { select: { name: true, email: true } },
          foundItem: { select: { code: true, title: true, category: true, storageLocation: true } },
        },
      }),
      prisma.claim.count({
        where: {
          status: ClaimStatus.APPROVED,
          foundItem: { status: { not: ItemStatus.RETURNED } },
        },
      }),
      prisma.lostReport.findMany({
        where: { status: { in: [ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW, ReportStatus.ACTIVE_SEARCH, ReportStatus.MATCHED] } },
        orderBy: [{ updatedAt: "asc" }],
        take: 6,
        include: {
          reporterUser: { select: { name: true, email: true } },
          matchedItem: { select: { code: true, title: true } },
        },
      }),
      prisma.lostReport.count({
        where: { status: { in: [ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW, ReportStatus.ACTIVE_SEARCH, ReportStatus.MATCHED] } },
      }),
      prisma.aIEvidenceLog.findMany({
        where: {
          dismissedAt: null,
          foundItemId: null,
        },
        orderBy: { detectedAtUtc: "asc" },
        take: 6,
      }),
      prisma.aIEvidenceLog.count({
        where: {
          dismissedAt: null,
          foundItemId: null,
        },
      }),
      prisma.foundItem.findMany({
        where: {
          foundAtUtc: { lt: expiredCutoff },
          status: { notIn: [ItemStatus.RETURNED, ItemStatus.ARCHIVED] },
        },
        orderBy: { foundAtUtc: "asc" },
        take: 6,
      }),
      prisma.foundItem.count({
        where: {
          foundAtUtc: { lt: expiredCutoff },
          status: { notIn: [ItemStatus.RETURNED, ItemStatus.ARCHIVED] },
        },
      }),
      prisma.foundItem.count({
        where: {
          foundAtUtc: {
            lt: nearExpiryCutoff,
            gte: expiredCutoff,
          },
          status: { notIn: [ItemStatus.RETURNED, ItemStatus.ARCHIVED] },
        },
      }),
    ]);

    res.json({
      generatedAt: now,
      retentionPolicy: {
        foundItemRetentionDays: retentionDays,
      },
      counts: {
        pendingClaims: pendingClaimsCount,
        inquiryClaims: inquiryClaimsCount,
        approvedPickups: approvedPickupsCount,
        activeReports: activeReportsCount,
        pendingSnapshots: pendingSnapshotsCount,
        expiredInventory: expiredInventoryCount,
        nearRetentionInventory: nearRetentionCount,
      },
      queues: {
        pendingClaims: pendingClaims.map((claim) => ({
          id: claim.id,
          code: claim.claimCode,
          title: claim.foundItem.title,
          subjectCode: claim.foundItem.code,
          status: claim.status,
          ownerName: claim.claimantUser.name,
          route: `/admin/claims?focus=${claim.claimCode}`,
          dueAt: claim.reservationExpiresAt,
          urgency: claim.reservationExpiresAt && claim.reservationExpiresAt <= reservationWarningCutoff ? "high" : "normal",
          nextAction: claim.reservationExpiresAt && claim.reservationExpiresAt <= reservationWarningCutoff ? "Review before hold expires" : "Review proof",
        })),
        inquiryClaims: inquiryClaims.map((claim) => ({
          id: claim.id,
          code: claim.claimCode,
          title: claim.foundItem.title,
          subjectCode: claim.foundItem.code,
          status: claim.status,
          ownerName: claim.claimantUser.name,
          route: `/admin/claims?focus=${claim.claimCode}&status=INQUIRY_REQUIRED`,
          dueAt: claim.reservationExpiresAt,
          urgency: claim.reservationExpiresAt && claim.reservationExpiresAt <= reservationWarningCutoff ? "high" : "normal",
          nextAction: "Waiting for student response",
        })),
        approvedPickups: approvedPickups.map((claim) => ({
          id: claim.id,
          code: claim.claimCode,
          title: claim.foundItem.title,
          subjectCode: claim.foundItem.code,
          status: claim.status,
          ownerName: claim.claimantUser.name,
          route: `/admin/inventory?focus=${claim.foundItem.code}`,
          dueAt: claim.pickupTokenExpires,
          urgency: claim.pickupTokenExpires && claim.pickupTokenExpires <= pickupWarningCutoff ? "high" : "normal",
          nextAction: claim.pickupTokenExpires && claim.pickupTokenExpires <= pickupWarningCutoff ? "Pickup token expiring soon" : "Ready for handover",
        })),
        activeReports: activeReports.map((report) => ({
          id: report.id,
          code: report.reportCode,
          title: report.title,
          subjectCode: report.matchedItem?.code ?? null,
          status: report.status,
          ownerName: report.reporterUser.name,
          route: `/admin/reports?focus=${report.reportCode}`,
          dueAt: report.updatedAt,
          urgency: report.updatedAt <= staleReportCutoff || report.status === ReportStatus.MATCHED ? "high" : "normal",
          nextAction: report.status === ReportStatus.MATCHED
            ? "Matched, follow pickup process"
            : report.updatedAt <= staleReportCutoff
              ? "Review stale report"
              : report.status === ReportStatus.ACTIVE_SEARCH
                ? "Search active"
                : "Needs review",
        })),
        pendingSnapshots: pendingSnapshots.map((snapshot) => ({
          id: snapshot.id,
          code: snapshot.id.slice(0, 8).toUpperCase(),
          title: readSnapshotCategory(snapshot.detectionMeta),
          subjectCode: snapshot.sourceCameraId,
          status: "PENDING_REVIEW",
          ownerName: "AI Monitor",
          route: "/admin/snapshots",
          dueAt: snapshot.detectedAtUtc,
          urgency: snapshot.detectedAtUtc <= staleSnapshotCutoff ? "high" : "normal",
          nextAction: snapshot.detectedAtUtc <= staleSnapshotCutoff ? "Review stale snapshot" : "Review AI snapshot",
        })),
        expiredInventory: expiredInventory.map((item) => ({
          id: item.id,
          code: item.code,
          title: item.title,
          subjectCode: item.category,
          status: item.status,
          ownerName: item.foundLocation,
          route: `/admin/expired-inventory?focus=${item.code}`,
          dueAt: item.foundAtUtc,
          urgency: "high",
          nextAction: "Expired, archive or dispose",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

function readSnapshotCategory(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "AI detected item";
  }

  const category = (value as { category?: unknown }).category;
  return typeof category === "string" && category.trim() ? category : "AI detected item";
}
