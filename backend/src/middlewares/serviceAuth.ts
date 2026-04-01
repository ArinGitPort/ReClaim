import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "@/config/env.js";
import { HttpError } from "@/utils/errors.js";

export function requireServiceToken(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("x-service-token");
  if (!header) {
    throw new HttpError(401, "Invalid service token");
  }

  const provided = Buffer.from(header);
  const expected = Buffer.from(env.serviceToken);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new HttpError(401, "Invalid service token");
  }

  next();
}