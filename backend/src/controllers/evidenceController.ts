import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { uploadsRoot } from "@/config/paths.js";
import { HttpError } from "@/utils/errors.js";

const paramsSchema = z.object({ filename: z.string().min(1) });

export async function getEvidenceFile(req: Request, res: Response): Promise<void> {
  const { filename: rawFilename } = paramsSchema.parse(req.params);
  const filename = path.basename(rawFilename);
  if (!filename) {
    throw new HttpError(400, "Invalid filename");
  }

  const absolutePath = path.join(uploadsRoot, filename);
  if (!absolutePath.startsWith(uploadsRoot)) {
    throw new HttpError(400, "Invalid path");
  }

  if (!fs.existsSync(absolutePath)) {
    throw new HttpError(404, "Evidence file not found");
  }

  res.sendFile(absolutePath);
}
