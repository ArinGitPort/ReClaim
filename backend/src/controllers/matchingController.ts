import type { Request, Response, NextFunction } from "express";
import { computeMatchesForReport } from "@/services/matchingService.js";
import { z } from "zod";

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function getReportMatches(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const matches = await computeMatchesForReport(id);
    
    res.json({ matches });
  } catch (error) {
    next(error);
  }
}
