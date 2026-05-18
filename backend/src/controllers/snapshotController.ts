import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { HttpError } from "@/utils/errors.js";
import { logAudit } from "@/services/auditService.js";
import { AuditAction } from "@prisma/client";

const createSnapshotSchema = z.object({
  sourceCameraId: z.string().min(1),
  snapshotHash: z.string().optional(),
  detectionMeta: z.string().transform((str) => {
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }),
});

export async function uploadSnapshot(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new HttpError(400, "Snapshot image is required");
  }

  const { sourceCameraId, snapshotHash, detectionMeta } = createSnapshotSchema.parse(req.body);
  const snapshotPath = `/uploads/items/${req.file.filename}`;

  const evidenceLog = await prisma.aIEvidenceLog.create({
    data: {
      sourceCameraId,
      snapshotPath,
      snapshotHash,
      detectionMeta,
      detectedAtUtc: new Date(),
      isEncrypted: false,
    },
  });

  res.status(201).json({ evidenceLog });
}

export async function getSnapshots(req: Request, res: Response): Promise<void> {
  const snapshots = await prisma.aIEvidenceLog.findMany({
    where: { foundItemId: null, dismissedAt: null },
    orderBy: { detectedAtUtc: 'desc' },
  });

  res.json({ snapshots });
}

export async function dismissSnapshot(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  if (!id) {
    throw new HttpError(400, "Snapshot ID is required");
  }

  const actorUserId = req.user?.id;
  if (!actorUserId) {
    throw new HttpError(401, "Unauthorized");
  }

  const snapshot = await prisma.aIEvidenceLog.findUnique({ where: { id } });
  if (!snapshot) {
    throw new HttpError(404, "Snapshot not found");
  }

  await prisma.aIEvidenceLog.update({
    where: { id },
    data: { dismissedAt: new Date() },
  });

  await logAudit({
    actorUserId,
    action: AuditAction.SNAPSHOT_DISMISSED,
    targetType: "snapshot",
    targetId: snapshot.id,
    description: "Admin dismissed an AI snapshot as a false alarm",
  });

  res.json({ success: true });
}

const logFoundSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  color: z.string().min(2),
  foundLocation: z.string().min(2),
});

export async function logSnapshotAsFound(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  if (!id) {
    throw new HttpError(400, "Snapshot ID is required");
  }

  const actorUserId = req.user?.id;
  if (!actorUserId) {
    throw new HttpError(401, "Unauthorized");
  }

  const body = logFoundSchema.parse(req.body);

  const snapshot = await prisma.aIEvidenceLog.findUnique({ where: { id } });
  if (!snapshot) {
    throw new HttpError(404, "Snapshot not found");
  }

  if (snapshot.foundItemId) {
    throw new HttpError(400, "Snapshot has already been logged as found");
  }

  // Auto-generate a unique code
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `FI-${timestamp}-${randomStr}`;

  const item = await prisma.foundItem.create({
    data: {
      code,
      title: body.title,
      category: body.category,
      color: body.color,
      foundLocation: body.foundLocation,
      foundAtUtc: snapshot.detectedAtUtc,
      publicDescription: "AI-detected item log",
      status: "AVAILABLE",
      createdById: actorUserId,
    },
  });

  // Link snapshot to the new item
  await prisma.aIEvidenceLog.update({
    where: { id },
    data: { foundItemId: item.id },
  });

  await logAudit({
    actorUserId,
    action: AuditAction.ITEM_CREATED,
    targetType: "found_item",
    targetId: item.id,
    description: "Admin logged an AI snapshot as a found item",
    targetReferenceCode: item.code,
    payload: {
      code: item.code,
      category: item.category,
      snapshotId: id,
    },
  });

  res.json({ item });
}

export async function getDismissedSnapshots(req: Request, res: Response): Promise<void> {
  const snapshots = await prisma.aIEvidenceLog.findMany({
    where: { dismissedAt: { not: null } },
    orderBy: { dismissedAt: 'desc' },
  });

  res.json({ snapshots });
}

export async function restoreSnapshot(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  if (!id) {
    throw new HttpError(400, "Snapshot ID is required");
  }

  const actorUserId = req.user?.id;
  if (!actorUserId) {
    throw new HttpError(401, "Unauthorized");
  }

  const snapshot = await prisma.aIEvidenceLog.findUnique({ where: { id } });
  if (!snapshot) {
    throw new HttpError(404, "Snapshot not found");
  }

  if (!snapshot.dismissedAt) {
    throw new HttpError(400, "Snapshot is not dismissed");
  }

  await prisma.aIEvidenceLog.update({
    where: { id },
    data: { dismissedAt: null },
  });

  await logAudit({
    actorUserId,
    action: AuditAction.SNAPSHOT_RESTORED,
    targetType: "snapshot",
    targetId: snapshot.id,
    description: "Admin restored a dismissed AI snapshot to the review queue",
  });

  res.json({ success: true });
}
