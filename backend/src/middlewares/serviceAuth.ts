import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../utils/errors.js";

export function requireServiceToken(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("x-service-token");
  if (!header || header !== env.serviceToken) {
    throw new HttpError(401, "Invalid service token");
  }

  next();
}