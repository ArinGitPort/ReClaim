import type { Request, Response } from "express";
import { getAiDaemonStatus, startAiDaemon, stopAiDaemon } from "@/services/aiDaemonService.js";

export async function getAiServiceStatus(_req: Request, res: Response): Promise<void> {
  res.json({ aiService: await getAiDaemonStatus() });
}

export async function startAiService(_req: Request, res: Response): Promise<void> {
  res.json({ aiService: await startAiDaemon() });
}

export async function stopAiService(_req: Request, res: Response): Promise<void> {
  res.json({ aiService: await stopAiDaemon() });
}
