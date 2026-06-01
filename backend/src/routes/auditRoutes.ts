import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { getAuditLogs } from "@/controllers/auditController.js";
import { requireAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const auditRoutes = Router();

auditRoutes.use(requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.AUDIT_LOGS));
auditRoutes.get("/logs", asyncHandler(getAuditLogs));
