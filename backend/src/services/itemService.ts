import { ItemStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { createCode } from "@/utils/codes.js";

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
  status?: ItemStatus;
  page?: number;
  limit?: number;
}) {
  const where = {
    status: filters.status ?? ItemStatus.AVAILABLE,
    category: filters.category,
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
}) {
  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);

  const where: Prisma.FoundItemWhereInput = {
    status: filters.status ?? { not: ItemStatus.RETURNED },
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
        claims: true,
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
    },
  });
}
