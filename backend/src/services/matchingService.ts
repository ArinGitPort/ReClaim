import { prisma } from "@/lib/prisma.js";
import { ItemStatus } from "@prisma/client";

type ScoredMatch = {
  id: string;
  code: string;
  title: string;
  category: string;
  color: string;
  foundAtUtc: Date;
  foundLocation: string;
  status: string;
  privateData: any;
  aiEvidenceLogs: any[];
  matchScore: number;
  reasons: string[];
};

export async function computeMatchesForReport(reportId: string): Promise<ScoredMatch[]> {
  const report = await prisma.lostReport.findUnique({
    where: { id: reportId },
    include: {
      reporterUser: true,
    },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  // Get only AVAILABLE items (do not match items that are already CLAIM_PENDING)
  const items = await prisma.foundItem.findMany({
    where: { 
      status: ItemStatus.AVAILABLE
    },
    include: {
      aiEvidenceLogs: true,
    },
  });

  const scoredMatches = items.map((item) => {
    let score = 20; // base score
    const reasons: string[] = [];

    // 1. Category Match
    if (item.category.trim().toLowerCase() === report.category.trim().toLowerCase()) {
      score += 30;
      reasons.push("Category match");
    }

    // 2. Color Match
    const itemColor = item.color.trim().toLowerCase();
    const reportColor = report.color.trim().toLowerCase();
    if (itemColor && reportColor && itemColor !== "not specified" && reportColor !== "not specified" && itemColor === reportColor) {
      score += 20;
      reasons.push("Color match");
    }

    // 3. Location Proximity
    const itemLoc = item.foundLocation.trim().toLowerCase();
    const reportLoc = report.location.trim().toLowerCase();
    if (itemLoc && reportLoc && (itemLoc.includes(reportLoc) || reportLoc.includes(itemLoc))) {
      score += 15;
      reasons.push("Location proximity");
    }

    // 4. Date Proximity
    const foundTime = item.foundAtUtc.getTime();
    const lostTime = report.reportedLostAtUtc.getTime();
    const diffDays = (foundTime - lostTime) / (1000 * 60 * 60 * 24);

    if (diffDays >= -1 && diffDays <= 7) {
      score += 15;
      reasons.push("Optimal date range");
    } else if (diffDays >= -2 && diffDays <= 30) {
      score += 8;
      reasons.push("Plausible date range");
    } else if (diffDays < -1) {
      score -= 15; // found before lost
    }

    // 5. Keyword Wording Match
    const haystack = `${item.title} ${item.publicDescription || ""} ${item.privateDiscoveryNote || ""}`.toLowerCase();
    const query = report.title.toLowerCase();
    const tokens = query.split(/\s+/).filter(t => t.length > 2);
    let overlapCount = 0;
    
    tokens.forEach((token) => {
      if (haystack.includes(token)) {
        overlapCount++;
      }
    });

    if (overlapCount > 0) {
      score += Math.min(overlapCount * 5, 10);
      reasons.push("Text details match");
    }

    // 6. Proactive Upload Image Match (Simulated Visual Confidence)
    const reportProof = (report.proofData as Record<string, any>) || {};
    const reportHasImage = reportProof.attachments && Array.isArray(reportProof.attachments) && reportProof.attachments.length > 0;
    
    const itemPrivate = (item.privateData as Record<string, any>) || {};
    const itemHasImage = itemPrivate.photoUrl || (item.aiEvidenceLogs && item.aiEvidenceLogs.length > 0);

    if (reportHasImage && itemHasImage) {
      score += 10;
      reasons.push("Visual hue match");
    }

    // Final normalization
    const matchScore = Math.min(Math.max(score, 1), 99);

    return {
      id: item.id,
      code: item.code,
      title: item.title,
      category: item.category,
      color: item.color,
      foundAtUtc: item.foundAtUtc,
      foundLocation: item.foundLocation,
      status: item.status,
      privateData: item.privateData,
      aiEvidenceLogs: item.aiEvidenceLogs,
      matchScore,
      reasons: reasons.slice(0, 4),
    };
  });

  // Sort by score descending
  return scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
}
