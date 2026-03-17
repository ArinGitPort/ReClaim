import { AuditAction, ItemStatus, type Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { createFoundItem, listAdminItems, listPublicItems } from "../services/itemService.js";
import { logAudit } from "../services/auditService.js";
import { HttpError } from "../utils/errors.js";

const createItemSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  color: z.string().min(2),
  foundLocation: z.string().min(2),
  foundAtUtc: z.string().datetime(),
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

export async function getPublicItems(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const statusQuery = typeof req.query.status === "string" ? req.query.status : undefined;
  const status = statusQuery && Object.values(ItemStatus).includes(statusQuery as ItemStatus)
    ? (statusQuery as ItemStatus)
    : undefined;

  const items = await listPublicItems({ search, category, status });
  res.json({ items });
}

export async function getAdminItems(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const items = await listAdminItems(search);
  res.json({ items });
}

export async function postItem(req: Request, res: Response): Promise<void> {
  const body = createItemSchema.parse(req.body);
  const item = await createFoundItem({
    actorUserId: req.user!.id,
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
    actorUserId: req.user!.id,
    action: AuditAction.ITEM_CREATED,
    targetType: "found_item",
    targetId: item.id,
    description: "Admin logged a new found item",
    payload: {
      code: item.code,
      category: item.category,
      status: item.status,
    },
  });

  res.status(201).json({ item });
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
    payload: {
      code: item.code,
      category: item.category,
      status: item.status,
    },
  });

  res.status(201).json({ item });
}
