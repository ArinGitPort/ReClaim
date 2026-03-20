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
}) {
  return prisma.foundItem.findMany({
    where: {
      status: filters.status ?? ItemStatus.AVAILABLE,
      category: filters.category,
      OR: filters.search
        ? [
            { title: { contains: filters.search, mode: "insensitive" } },
            { publicDescription: { contains: filters.search, mode: "insensitive" } },
            { code: { contains: filters.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
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
  });
}

export async function listAdminItems(search?: string) {
  return prisma.foundItem.findMany({
    where: {
      OR: search
        ? [
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      aiEvidenceLogs: true,
      claims: true,
    },
    orderBy: { createdAt: "desc" },
  });
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
