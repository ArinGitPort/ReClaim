import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";

const createCameraSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  sourceUrl: z.string().min(1),
});

export async function getCameras(req: Request, res: Response): Promise<void> {
  const cameras = await prisma.camera.findMany({
    orderBy: { createdAt: 'asc' },
  });
  res.json({ cameras });
}

export async function createCamera(req: Request, res: Response): Promise<void> {
  const body = createCameraSchema.parse(req.body);

  // Auto-generate code like CAM-01
  const count = await prisma.camera.count();
  const code = `CAM-${String(count + 1).padStart(2, '0')}`;

  const camera = await prisma.camera.create({
    data: {
      code,
      name: body.name,
      location: body.location,
      sourceUrl: body.sourceUrl,
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

export async function pingCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  
  const camera = await prisma.camera.update({
    where: { id },
    data: { 
      lastPingAtUtc: new Date(),
      isOnline: true,
    },
  });

  res.json({ success: true, lastPingAtUtc: camera.lastPingAtUtc });
}

export async function deleteCamera(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  
  await prisma.camera.delete({ where: { id } });
  
  res.json({ success: true });
}
