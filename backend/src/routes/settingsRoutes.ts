import { Router } from "express";
import { getSettings, patchSettings } from "@/controllers/settingsController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const settingsRoutes = Router();

settingsRoutes.get("/", requireAuth, requireRole(["STAFF", "ADMIN"]), asyncHandler(getSettings));
settingsRoutes.patch("/", requireAuth, requireRole(["ADMIN"]), asyncHandler(patchSettings));
