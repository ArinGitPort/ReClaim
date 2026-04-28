import { ClaimStatus, ReportStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma.js"
import { createPickupToken } from "@/utils/codes.js"
import { HttpError } from "@/utils/errors.js"

type PickupItem = {
  source: "CLAIM" | "REPORT_MATCH"
  sourceId: string
  sourceCode: string
  itemId: string
  itemTitle: string
  pickupToken: string
  pickupTokenExpires: Date | null
  officeLocation: string
  createdAt: Date
}

export async function listUserPickups(userId: string): Promise<PickupItem[]> {
  const claimPickups = await prisma.claim.findMany({
    where: {
      claimantUserId: userId,
      status: ClaimStatus.APPROVED,
      pickupToken: { not: null },
    },
    include: {
      foundItem: {
        select: {
          id: true,
          code: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const reportPickups = await prisma.lostReport.findMany({
    where: {
      reporterUserId: userId,
      status: ReportStatus.MATCHED,
      matchedItemId: { not: null },
    },
    include: {
      matchedItem: {
        select: {
          id: true,
          code: true,
          title: true,
          claims: {
            where: {
              claimantUserId: userId,
              status: ClaimStatus.APPROVED,
              pickupToken: { not: null },
            },
            select: {
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
  })

  const mappedClaimPickups: PickupItem[] = claimPickups.map((claim) => ({
    source: "CLAIM",
    sourceId: claim.id,
    sourceCode: claim.claimCode,
    itemId: claim.foundItem.id,
    itemTitle: claim.foundItem.title,
    pickupToken: claim.pickupToken ?? "",
    pickupTokenExpires: claim.pickupTokenExpires,
    officeLocation: "Campus Admin Office",
    createdAt: claim.createdAt,
  }))

  const mappedReportPickups: PickupItem[] = reportPickups.flatMap((report) => {
    const matchedItem = report.matchedItem
    const matchedClaim = matchedItem?.claims?.[0]
    if (!matchedItem || !matchedClaim?.pickupToken) {
      return []
    }

    return [{
      source: "REPORT_MATCH" as const,
      sourceId: report.id,
      sourceCode: report.reportCode,
      itemId: matchedItem.id,
      itemTitle: matchedItem.title,
      pickupToken: matchedClaim.pickupToken,
      pickupTokenExpires: matchedClaim.pickupTokenExpires,
      officeLocation: "Campus Admin Office",
      createdAt: report.createdAt,
    }]
  })

  const reportItemIds = new Set(mappedReportPickups.map((p) => p.itemId))
  const dedupedClaimPickups = mappedClaimPickups.filter((p) => !reportItemIds.has(p.itemId))

  return [...dedupedClaimPickups, ...mappedReportPickups].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

export async function rerollPickupToken(userId: string, itemId: string): Promise<string> {
  const claim = await prisma.claim.findFirst({
    where: {
      claimantUserId: userId,
      foundItemId: itemId,
      status: ClaimStatus.APPROVED,
      pickupToken: { not: null },
    },
  })

  if (!claim) {
    throw new HttpError(404, "Active approved claim with token not found or doesn't belong to you")
  }

  const isExpired = claim.pickupTokenExpires && claim.pickupTokenExpires.getTime() < Date.now()
  if (!isExpired) {
    throw new HttpError(400, "Token has not expired yet")
  }

  const newToken = createPickupToken()
  const newExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)

  await prisma.claim.update({
    where: { id: claim.id },
    data: {
      pickupToken: newToken,
      pickupTokenExpires: newExpires,
    },
  })

  return newToken
}
