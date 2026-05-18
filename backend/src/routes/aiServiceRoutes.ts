import { Router } from "express";
import { startAiService, getAiServiceStatus, stopAiService } from "@/controllers/aiServiceController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const aiServiceRoutes = Router();

aiServiceRoutes.use(requireAuth, requireRole(["ADMIN", "STAFF"]));

aiServiceRoutes.get("/status", asyncHandler(getAiServiceStatus));
aiServiceRoutes.post("/start", asyncHandler(startAiService));
aiServiceRoutes.post("/stop", asyncHandler(stopAiService));
