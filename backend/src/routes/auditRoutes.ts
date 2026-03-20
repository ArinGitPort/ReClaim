import { Router } from "express";
import { getAuditLogs } from "@/controllers/auditController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const auditRoutes = Router();

auditRoutes.use(requireAuth, requireRole(["ADMIN", "STAFF"]));
auditRoutes.get("/logs", asyncHandler(getAuditLogs));
