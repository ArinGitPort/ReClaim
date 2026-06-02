import type { Request, Response } from "express";
import { CameraStreamStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";
import { HttpError } from "@/utils/errors.js";
import { env } from "@/config/env.js";

const createCameraSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  sourceUrl: z.string().min(1),
  aiConfThreshold: z.number().min(0.1).max(1.0).optional(),
  aiFrameSkip: z.number().min(1).max(30).optional(),
});

const updateCameraSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  sourceUrl: z.string().min(1),
  aiConfThreshold: z.number().min(0.1).max(1.0).optional(),
  aiFrameSkip: z.number().min(1).max(30).optional(),
});

export async function getCameras(req: Request, res: Response): Promise<void> {
  const cameras = await prisma.camera.findMany({
    orderBy: { createdAt: 'asc' },
  });
  res.json({ cameras });
}

export async function getCameraSources(_req: Request, res: Response): Promise<void> {
  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/camera-sources`, {
      headers: { "x-service-token": env.serviceToken },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new HttpError(response.status, "Camera service could not scan local camera sources.");
    }

    res.json(await response.json());
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(503, "Camera service is not available for source detection.");
  }
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
      isOnline: false,
      streamStatus: CameraStreamStatus.CONNECTING,
      lastError: null,
      aiEnabled: false,
      aiConfThreshold: body.aiConfThreshold ?? 0.35,
      aiFrameSkip: body.aiFrameSkip ?? 6,
    },
  });

  res.status(201).json({ camera });
}

const updateAiSchema = z.object({
  aiEnabled: z.boolean(),
});

const updateStreamSchema = z.object({
  streamEnabled: z.boolean(),
});

export async function updateCameraAi(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { aiEnabled } = updateAiSchema.parse(req.body);
  await ensureCameraExists(id);

  const camera = await prisma.camera.update({
    where: { id },
    data: { aiEnabled },
  });

  res.json({ camera });
}

export async function updateCameraStream(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { streamEnabled } = updateStreamSchema.parse(req.body);
  await ensureCameraExists(id);

  const camera = await prisma.camera.update({
    where: { id },
    data: streamEnabled
      ? {
          streamEnabled: true,
          streamStatus: CameraStreamStatus.CONNECTING,
          lastError: null,
        }
      : {
          streamEnabled: false,
          isOnline: false,
          streamStatus: CameraStreamStatus.OFFLINE,
          lastError: "Camera stream is paused by staff",
        },
  });

  if (!streamEnabled) {
    try {
      await fetch(`${env.aiServiceBaseUrl}/cameras/${id}/restart`, {
        method: "POST",
        headers: { "x-service-token": env.serviceToken },
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      // Service may be offline; persisted state is enough.
    }
  }

  res.json({ camera });
}

export async function updateCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const body = updateCameraSchema.parse(req.body);
  const normalizedSourceUrl = body.sourceUrl.trim();

  const existingSource = await prisma.camera.findFirst({
    where: {
      sourceUrl: normalizedSourceUrl,
      id: { not: id },
    },
    select: { name: true },
  });
  if (existingSource) {
    throw new HttpError(409, `Camera source is already used by ${existingSource.name}. Use a different webcam index or stream URL.`);
  }

  const currentCamera = await prisma.camera.findUnique({ where: { id } });
  if (!currentCamera) {
    throw new HttpError(404, "Camera not found");
  }

  const sourceChanged = currentCamera.sourceUrl !== normalizedSourceUrl;

  const camera = await prisma.camera.update({
    where: { id },
    data: {
      name: body.name,
      location: body.location,
      sourceUrl: normalizedSourceUrl,
      ...(sourceChanged
        ? {
            isOnline: false,
            streamStatus: CameraStreamStatus.CONNECTING,
            lastPingAtUtc: null,
            lastFrameAtUtc: null,
            lastError: null,
          }
        : {}),
      aiConfThreshold: body.aiConfThreshold ?? 0.35,
      aiFrameSkip: body.aiFrameSkip ?? 6,
    },
  });

  res.json({ camera });
}

const pingCameraSchema = z.object({
  isOnline: z.boolean().optional(),
  streamStatus: z.nativeEnum(CameraStreamStatus).optional(),
  lastFrameAtUtc: z.string().datetime().optional().nullable(),
  lastError: z.string().optional().nullable(),
});

export async function pingCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const body = pingCameraSchema.parse(req.body ?? {});
  const isOnline = body.isOnline ?? true;
  await ensureCameraExists(id);
  
  const camera = await prisma.camera.update({
    where: { id },
    data: { 
      lastPingAtUtc: new Date(),
      isOnline,
      streamStatus: body.streamStatus ?? (isOnline ? CameraStreamStatus.ONLINE : CameraStreamStatus.OFFLINE),
      lastFrameAtUtc: body.lastFrameAtUtc === null
        ? null
        : body.lastFrameAtUtc
          ? new Date(body.lastFrameAtUtc)
          : undefined,
      lastError: body.lastError === null ? null : body.lastError,
    },
  });

  res.json({ success: true, lastPingAtUtc: camera.lastPingAtUtc });
}

export async function restartCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await ensureCameraExists(id);

  const camera = await prisma.camera.update({
    where: { id },
    data: {
      isOnline: false,
      streamStatus: CameraStreamStatus.CONNECTING,
      lastError: null,
      lastFrameAtUtc: null,
    },
  });

  let daemonAccepted = false;
  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/cameras/${id}/restart`, {
      method: "POST",
      headers: { "x-service-token": env.serviceToken },
      signal: AbortSignal.timeout(1500),
    });
    daemonAccepted = response.ok;
  } catch {
    daemonAccepted = false;
  }

  res.json({ camera, daemonAccepted });
}

export async function deleteCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await ensureCameraExists(id);
  
  await prisma.camera.delete({ where: { id } });
  
  res.json({ success: true });
}

async function ensureCameraExists(id: string): Promise<void> {
  const camera = await prisma.camera.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!camera) {
    throw new HttpError(404, "Camera not found. Refresh the camera list and try again.");
  }
}
