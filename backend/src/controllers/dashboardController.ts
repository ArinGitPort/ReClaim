import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/lib/prisma.js";

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
