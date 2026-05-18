import { ClaimStatus, ItemStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { createCode } from "@/utils/codes.js";
import { getSystemSettings } from "@/services/settingsService.js";

export async function createFoundItem(input: {
  actorUserId: string;
  title: string;
  category: string;
  color: string;
  foundLocation: string;
  foundAtUtc: Date;
  publicDescription?: string;
  privateDiscoveryNote?: string;
  privateData?: Prisma.InputJsonValue;
  isHighValue?: boolean;
  storageLocation?: string;
  evidence?: {
    sourceCameraId: string;
    snapshotPath: string;
    snapshotHash?: string;
    detectionMeta: Prisma.InputJsonValue;
    detectedAtUtc: Date;
  };
}) {
  return prisma.foundItem.create({
    data: {
      code: createCode("ITEM"),
      title: input.title,
      category: input.category,
      color: input.color,
      foundLocation: input.foundLocation,
      foundAtUtc: input.foundAtUtc,
      publicDescription: input.publicDescription,
      privateDiscoveryNote: input.privateDiscoveryNote,
      privateData: input.privateData,
      isHighValue: input.isHighValue ?? false,
      storageLocation: input.storageLocation,
      createdById: input.actorUserId,
      aiEvidenceLogs: input.evidence
        ? {
            create: {
              sourceCameraId: input.evidence.sourceCameraId,
              snapshotPath: input.evidence.snapshotPath,
              snapshotHash: input.evidence.snapshotHash,
              detectionMeta: input.evidence.detectionMeta,
              detectedAtUtc: input.evidence.detectedAtUtc,
            },
          }
        : undefined,
    },
  });
}

export async function listPublicItems(filters: {
  search?: string;
  category?: string;
  location?: string;
  dateStart?: Date;
  status?: ItemStatus;
  page?: number;
  limit?: number;
}) {
  const where: Record<string, unknown> = {
    status: filters.status ?? { in: [ItemStatus.AVAILABLE, ItemStatus.CLAIM_PENDING] },
    category: filters.category,
    foundLocation: filters.location ? { contains: filters.location, mode: "insensitive" } : undefined,
    foundAtUtc: filters.dateStart ? { gte: filters.dateStart } : undefined,
    OR: filters.search
      ? [
          { title: { contains: filters.search, mode: "insensitive" as const } },
          { publicDescription: { contains: filters.search, mode: "insensitive" as const } },
          { code: { contains: filters.search, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 12, 1), 100);

  const [items, total] = await Promise.all([
    prisma.foundItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        code: true,
        title: true,
        category: true,
        color: true,
        foundLocation: true,
        foundAtUtc: true,
        publicDescription: true,
        status: true,
        isHighValue: true,
        privateData: true,
      },
    }),
    prisma.foundItem.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function listAdminItems(filters: {
  search?: string;
  status?: ItemStatus;
  category?: string;
  page?: number;
  limit?: number;
  expired?: boolean;
}) {
  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);
  const settings = filters.expired ? await getSystemSettings() : undefined;
  const retentionDays = settings?.retentionPolicy.foundItemRetentionDays ?? 30;

  const where: Prisma.FoundItemWhereInput = {
    status: filters.status ?? { notIn: [ItemStatus.RETURNED, ItemStatus.ARCHIVED] },
    ...(filters.expired ? {
      foundAtUtc: { lt: new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000) },
      status: { notIn: [ItemStatus.RETURNED, ItemStatus.ARCHIVED] }
    } : {}),
    category: filters.category,
    OR: filters.search
      ? [
          { code: { contains: filters.search, mode: "insensitive" as const } },
          { title: { contains: filters.search, mode: "insensitive" as const } },
          { category: { contains: filters.search, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  const [items, total] = await Promise.all([
    prisma.foundItem.findMany({
      where,
      include: {
        aiEvidenceLogs: true,
        claims: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            claimCode: true,
            status: true,
            pickupToken: true,
            pickupTokenExpires: true,
            claimantUserId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.foundItem.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

export function getApprovedHandoverClaim(
  claims: Array<{
    id: string;
    claimCode: string;
    status: ClaimStatus;
    pickupToken: string | null;
    pickupTokenExpires: Date | null;
    claimantUserId: string;
  }>
) {
  return claims.find((claim) => (
    claim.status === ClaimStatus.APPROVED &&
    Boolean(claim.pickupToken) &&
    (!claim.pickupTokenExpires || claim.pickupTokenExpires > new Date())
  ));
}

export async function updateFoundItem(input: {
  itemId: string;
  title?: string;
  category?: string;
  color?: string;
  foundLocation?: string;
  foundAtUtc?: Date;
  storageLocation?: string | null;
  privateDiscoveryNote?: string | null;
  status?: ItemStatus;
  isHighValue?: boolean;
  privateData?: Prisma.InputJsonValue;
}) {
  return prisma.foundItem.update({
    where: { id: input.itemId },
    data: {
      title: input.title,
      category: input.category,
      color: input.color,
      foundLocation: input.foundLocation,
      foundAtUtc: input.foundAtUtc,
      storageLocation: input.storageLocation,
      privateDiscoveryNote: input.privateDiscoveryNote,
      status: input.status,
      isHighValue: input.isHighValue,
      privateData: input.privateData,
    },
  });
}
