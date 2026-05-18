import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { HttpError } from "@/utils/errors.js";

const zonePointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

const cameraZoneSchema = z.object({
  label: z.string().min(1).max(80),
  type: z.enum(["monitor", "ignore"]).optional(),
  points: z.array(zonePointSchema).min(3).optional(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
  width: z.number().min(0).max(1).optional(),
  height: z.number().min(0).max(1).optional(),
}).refine((zone) => {
  const hasPolygon = Boolean(zone.points?.length);
  const hasRectangle = [zone.x, zone.y, zone.width, zone.height].every((value) => typeof value === "number");
  return hasPolygon || hasRectangle;
}, "Zone must include either polygon points or rectangle x/y/width/height values");

const cameraZoneConfigSchema = z.object({
  monitoredZones: z.array(cameraZoneSchema).default([]),
  ignoredZones: z.array(cameraZoneSchema).default([]),
}).nullable();

const createCameraSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  sourceUrl: z.string().min(1),
  zoneConfig: cameraZoneConfigSchema.optional(),
});

export async function getCameras(req: Request, res: Response): Promise<void> {
  const cameras = await prisma.camera.findMany({
    orderBy: { createdAt: 'asc' },
  });
  res.json({ cameras });
}

export async function createCamera(req: Request, res: Response): Promise<void> {
  const body = createCameraSchema.parse(req.body);
  const normalizedSourceUrl = body.sourceUrl.trim();

  const existingSource = await prisma.camera.findFirst({
    where: { sourceUrl: normalizedSourceUrl },
    select: { name: true },
  });
  if (existingSource) {
    throw new HttpError(409, `Camera source is already used by ${existingSource.name}. Use a different webcam index or stream URL.`);
  }

  // Auto-generate code like CAM-01
  const count = await prisma.camera.count();
  const code = `CAM-${String(count + 1).padStart(2, '0')}`;

  const camera = await prisma.camera.create({
    data: {
      code,
      name: body.name,
      location: body.location,
      sourceUrl: normalizedSourceUrl,
      zoneConfig: body.zoneConfig ?? undefined,
      isOnline: true,
      aiEnabled: false,
    },
  });

  res.status(201).json({ camera });
}

const updateAiSchema = z.object({
  aiEnabled: z.boolean(),
});

export async function updateCameraAi(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { aiEnabled } = updateAiSchema.parse(req.body);

  const camera = await prisma.camera.update({
    where: { id },
    data: { aiEnabled },
  });

  res.json({ camera });
}

const updateZoneConfigSchema = z.object({
  zoneConfig: cameraZoneConfigSchema,
});

export async function updateCameraZones(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { zoneConfig } = updateZoneConfigSchema.parse(req.body);

  const camera = await prisma.camera.update({
    where: { id },
    data: { zoneConfig: zoneConfig ?? Prisma.JsonNull },
  });

  res.json({ camera });
}

const pingCameraSchema = z.object({
  isOnline: z.boolean().optional(),
});

export async function pingCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const body = pingCameraSchema.parse(req.body ?? {});
  
  const camera = await prisma.camera.update({
    where: { id },
    data: { 
      lastPingAtUtc: new Date(),
      isOnline: body.isOnline ?? true,
    },
  });

  res.json({ success: true, lastPingAtUtc: camera.lastPingAtUtc });
}

export async function deleteCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  
  await prisma.camera.delete({ where: { id } });
  
  res.json({ success: true });
}
