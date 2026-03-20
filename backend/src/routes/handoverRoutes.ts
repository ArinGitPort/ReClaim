import { Router } from "express";
import { getHandoverLogs, getHandoverPreview, postHandover, postHandoverConfirm } from "@/controllers/handoverController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const handoverRoutes = Router();

handoverRoutes.use(requireAuth, requireRole(["ADMIN", "STAFF"]));
handoverRoutes.get("/logs", asyncHandler(getHandoverLogs));
handoverRoutes.get("/preview", asyncHandler(getHandoverPreview));
handoverRoutes.post("/confirm", asyncHandler(postHandoverConfirm));
handoverRoutes.post("/", asyncHandler(postHandover));
