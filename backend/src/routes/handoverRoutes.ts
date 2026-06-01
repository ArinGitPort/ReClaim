import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { getHandoverLogs, getHandoverPreview, postHandover, postHandoverCancel, postHandoverConfirm, postHandoverRestore } from "@/controllers/handoverController.js";
import { requireAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const handoverRoutes = Router();

handoverRoutes.use(requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.HANDOVER_LOG));
handoverRoutes.get("/logs", asyncHandler(getHandoverLogs));
handoverRoutes.get("/preview", asyncHandler(getHandoverPreview));
handoverRoutes.post("/cancel", asyncHandler(postHandoverCancel));
handoverRoutes.post("/confirm", asyncHandler(postHandoverConfirm));
handoverRoutes.post("/:id/restore", asyncHandler(postHandoverRestore));
handoverRoutes.post("/", asyncHandler(postHandover));
