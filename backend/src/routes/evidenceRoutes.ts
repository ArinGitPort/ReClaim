import { Router } from "express";
import { getEvidenceFile } from "@/controllers/evidenceController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const evidenceRoutes = Router();

evidenceRoutes.get("/:filename", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(getEvidenceFile));
