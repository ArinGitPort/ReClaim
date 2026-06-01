import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { getDashboardMetrics, getOperationsSummary } from "@/controllers/dashboardController.js";
import { requireAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.DASHBOARD), getDashboardMetrics);
dashboardRoutes.get("/operations", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.DASHBOARD), getOperationsSummary);
