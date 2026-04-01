import fs from "node:fs/promises";
import { AuditAction, ItemStatus, type Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "@/config/env.js";
import { prisma } from "@/lib/prisma.js";
import { createFoundItem, listAdminItems, listPublicItems, updateFoundItem } from "@/services/itemService.js";
import { logAudit } from "@/services/auditService.js";
import { HttpError } from "@/utils/errors.js";
import { emitItemUpdated } from "@/realtime/socket.js";

const createItemSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  color: z.string().min(2),
  foundLocation: z.string().min(2),
  foundAtUtc: z.string().datetime(),
  photoUrl: z.string().min(1).optional(),
  publicDescription: z.string().optional(),
  privateDiscoveryNote: z.string().optional(),
  privateData: z.record(z.string(), z.unknown()).optional(),
  storageLocation: z.string().optional(),
  evidence: z
    .object({
      sourceCameraId: z.string().min(2),
      snapshotPath: z.string().min(2),
      snapshotHash: z.string().optional(),
      detectionMeta: z.record(z.string(), z.unknown()),
      detectedAtUtc: z.string().datetime(),
    })
    .optional(),
});

const updateItemSchema = z.object({
  title: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  color: z.string().min(2).optional(),
  foundLocation: z.string().min(2).optional(),
  foundAtUtc: z.string().datetime().optional(),
  storageLocation: z.string().optional(),
  privateDiscoveryNote: z.string().optional(),
  status: z.nativeEnum(ItemStatus).optional(),
});

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function postItemPhoto(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new HttpError(400, "Photo file is required");
  }

  const fileType = await detectImageType(req.file.path);
  if (!fileType) {
    await fs.unlink(req.file.path).catch(() => undefined);
    throw new HttpError(400, "Uploaded file is not a valid image");
  }

  const photoUrl = `/uploads/items/${req.file.filename}`;
  res.status(201).json({ photoUrl });
}

export async function getPublicItems(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const statusQuery = typeof req.query.status === "string" ? req.query.status : undefined;
  const pageQuery = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limitQuery = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const expired = req.query.expired === "true";
  const status = statusQuery && Object.values(ItemStatus).includes(statusQuery as ItemStatus)
    ? (statusQuery as ItemStatus)
    : undefined;
  const page = Number.isFinite(pageQuery) && (pageQuery as number) > 0 ? (pageQuery as number) : 1;
  const limit = Number.isFinite(limitQuery) && (limitQuery as number) > 0 ? Math.min(limitQuery as number, 100) : 12;

  const result = await listPublicItems({ search, category, status, page, limit });
  res.json({
    items: result.items,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pageCount: result.pageCount,
    },
  });
}

export async function getAdminItems(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const statusQuery = typeof req.query.status === "string" ? req.query.status : undefined;
  const pageQuery = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limitQuery = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const expired = req.query.expired === "true";
  const status = statusQuery && Object.values(ItemStatus).includes(statusQuery as ItemStatus)
    ? (statusQuery as ItemStatus)
    : undefined;
  const page = Number.isFinite(pageQuery) && (pageQuery as number) > 0 ? (pageQuery as number) : 1;
  const limit = Number.isFinite(limitQuery) && (limitQuery as number) > 0 ? Math.min(limitQuery as number, 100) : 25;

  const result = await listAdminItems({
    search: search || undefined,
    category,
    status,
    page,
    limit,
  });

  res.json({
    items: result.items,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pageCount: result.pageCount,
    },
  });
}

export async function postItem(req: Request, res: Response): Promise<void> {
  const body = createItemSchema.parse(req.body);
  const privateDataRecord: Record<string, unknown> = body.privateData ? { ...body.privateData } : {};
  if (body.photoUrl) {
    privateDataRecord.photoUrl = body.photoUrl;
  }

  const privateData = Object.keys(privateDataRecord).length > 0
    ? (privateDataRecord as Prisma.InputJsonValue)
    : undefined;

  const item = await createFoundItem({
    actorUserId: req.user!.id,
    title: body.title,
    category: body.category,
    color: body.color,
    foundLocation: body.foundLocation,
    foundAtUtc: new Date(body.foundAtUtc),
    publicDescription: body.publicDescription,
    privateDiscoveryNote: body.privateDiscoveryNote,
    privateData,
    storageLocation: body.storageLocation,
    evidence: body.evidence
      ? {
          ...body.evidence,
          detectionMeta: body.evidence.detectionMeta as Prisma.InputJsonValue,
          detectedAtUtc: new Date(body.evidence.detectedAtUtc),
        }
      : undefined,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.ITEM_CREATED,
    targetType: "found_item",
    targetId: item.id,
    description: "Admin logged a new found item",
    targetReferenceCode: item.code,
    payload: {
      targetReferenceCode: item.code,
      code: item.code,
      category: item.category,
      status: item.status,
    },
  });

  emitItemUpdated({
    itemId: item.id,
    status: item.status,
  });

  res.status(201).json({ item });
}

export async function patchItem(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = updateItemSchema.parse(req.body);

  if (Object.keys(body).length === 0) {
    throw new HttpError(400, "At least one updatable field is required");
  }

  const beforeItem = await prisma.foundItem.findUnique({
    where: { id },
    select: {
      title: true,
      category: true,
      color: true,
      foundLocation: true,
      foundAtUtc: true,
      storageLocation: true,
      privateDiscoveryNote: true,
      status: true,
      code: true,
    },
  });

  if (!beforeItem) {
    throw new HttpError(404, "Item not found");
  }

  const item = await updateFoundItem({
    itemId: id,
    title: body.title,
    category: body.category,
    color: body.color,
    foundLocation: body.foundLocation,
    foundAtUtc: body.foundAtUtc ? new Date(body.foundAtUtc) : undefined,
    storageLocation: body.storageLocation,
    privateDiscoveryNote: body.privateDiscoveryNote,
    status: body.status,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.ITEM_UPDATED,
    targetType: "found_item",
    targetId: item.id,
    description: "Admin updated found item record",
    targetReferenceCode: item.code,
    payload: {
      targetReferenceCode: item.code,
      changes: buildChangePayload(beforeItem, item),
      before: {
        title: beforeItem.title,
        category: beforeItem.category,
        color: beforeItem.color,
        foundLocation: beforeItem.foundLocation,
        foundAtUtc: beforeItem.foundAtUtc,
        storageLocation: beforeItem.storageLocation,
        privateDiscoveryNote: beforeItem.privateDiscoveryNote,
        status: beforeItem.status,
      },
      after: {
        title: item.title,
        category: item.category,
        color: item.color,
        foundLocation: item.foundLocation,
        foundAtUtc: item.foundAtUtc,
        storageLocation: item.storageLocation,
        privateDiscoveryNote: item.privateDiscoveryNote,
        status: item.status,
      },
    },
  });

  emitItemUpdated({
    itemId: item.id,
    status: item.status,
  });

  res.json({ item });
}

export async function postAiItem(req: Request, res: Response): Promise<void> {
  const body = createItemSchema.parse(req.body);
  const actorUserId = env.aiActorUserId;
  if (!actorUserId) {
    throw new HttpError(500, "AI_ACTOR_USER_ID is not configured");
  }

  const item = await createFoundItem({
    actorUserId,
    title: body.title,
    category: body.category,
    color: body.color,
    foundLocation: body.foundLocation,
    foundAtUtc: new Date(body.foundAtUtc),
    publicDescription: body.publicDescription,
    privateDiscoveryNote: body.privateDiscoveryNote,
    privateData: body.privateData as Prisma.InputJsonValue | undefined,
    storageLocation: body.storageLocation,
    evidence: body.evidence
      ? {
          ...body.evidence,
          detectionMeta: body.evidence.detectionMeta as Prisma.InputJsonValue,
          detectedAtUtc: new Date(body.evidence.detectedAtUtc),
        }
      : undefined,
  });

  await logAudit({
    actorUserId,
    action: AuditAction.ITEM_CREATED,
    targetType: "found_item",
    targetId: item.id,
    description: "AI ingestion created a new found item",
    targetReferenceCode: item.code,
    payload: {
      targetReferenceCode: item.code,
      code: item.code,
      category: item.category,
      status: item.status,
    },
  });

  emitItemUpdated({
    itemId: item.id,
    status: item.status,
  });

  res.status(201).json({ item });
}

function buildChangePayload(
  beforeItem: {
    title: string;
    category: string;
    color: string;
    foundLocation: string;
    foundAtUtc: Date;
    storageLocation: string | null;
    privateDiscoveryNote: string | null;
    status: ItemStatus;
  },
  afterItem: {
    title: string;
    category: string;
    color: string;
    foundLocation: string;
    foundAtUtc: Date;
    storageLocation: string | null;
    privateDiscoveryNote: string | null;
    status: ItemStatus;
  }
) {
  const fields = [
    ["title", beforeItem.title, afterItem.title],
    ["category", beforeItem.category, afterItem.category],
    ["color", beforeItem.color, afterItem.color],
    ["foundLocation", beforeItem.foundLocation, afterItem.foundLocation],
    ["foundAtUtc", beforeItem.foundAtUtc.toISOString(), afterItem.foundAtUtc.toISOString()],
    ["storageLocation", beforeItem.storageLocation ?? null, afterItem.storageLocation ?? null],
    ["privateDiscoveryNote", beforeItem.privateDiscoveryNote ?? null, afterItem.privateDiscoveryNote ?? null],
    ["status", beforeItem.status, afterItem.status],
  ] as const;

  return fields
    .filter((field) => field[1] !== field[2])
    .map((field) => ({
      changedField: field[0],
      oldValue: field[1],
      newValue: field[2],
    }));
}

async function detectImageType(filePath: string): Promise<"jpeg" | "png" | "webp" | null> {
  const fileHandle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await fileHandle.read(buffer, 0, 16, 0);
    const header = buffer.subarray(0, bytesRead);

    const isJpeg = header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    if (isJpeg) {
      return "jpeg";
    }

    const isPng =
      header.length >= 8 &&
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47 &&
      header[4] === 0x0d &&
      header[5] === 0x0a &&
      header[6] === 0x1a &&
      header[7] === 0x0a;
    if (isPng) {
      return "png";
    }

    const riff = header.length >= 12 && header.subarray(0, 4).toString("ascii") === "RIFF";
    const webp = header.length >= 12 && header.subarray(8, 12).toString("ascii") === "WEBP";
    if (riff && webp) {
      return "webp";
    }

    return null;
  } finally {
    await fileHandle.close();
  }
}

export async function batchDisposeItems(req: Request, res: Response): Promise<void> {
  const { itemIds } = req.body;
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    res.status(400).json({ error: "itemIds array is required" });
    return;
  }
  
  const updated = await prisma.foundItem.updateMany({
    where: {
      id: { in: itemIds }
    },
    data: {
      status: ItemStatus.ARCHIVED
    }
  });
  
  res.json({ success: true, count: updated.count });
}