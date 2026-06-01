import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { applyDefaultStaffPermissions, getSettings, patchSettings } from "@/controllers/settingsController.js";
import { requireAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const settingsRoutes = Router();

settingsRoutes.get("/", requireAuth, requireRole(["STAFF", "ADMIN"]), asyncHandler(getSettings));
settingsRoutes.patch("/", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.SYSTEM_SETTINGS), asyncHandler(patchSettings));
settingsRoutes.post("/staff-defaults/apply", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.SYSTEM_SETTINGS), asyncHandler(applyDefaultStaffPermissions));
