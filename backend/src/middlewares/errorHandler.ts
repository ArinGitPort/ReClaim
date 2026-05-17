import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "@/utils/errors.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: err.flatten() });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
