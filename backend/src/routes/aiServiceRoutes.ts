import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { startAiService, getAiServiceStatus, stopAiService } from "@/controllers/aiServiceController.js";
import { requireAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const aiServiceRoutes = Router();

aiServiceRoutes.use(requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.LIVE_MONITOR));

aiServiceRoutes.get("/status", asyncHandler(getAiServiceStatus));
aiServiceRoutes.post("/start", asyncHandler(startAiService));
aiServiceRoutes.post("/stop", asyncHandler(stopAiService));
