import { Router } from "express";
import { getDashboardMetrics, getOperationsSummary } from "@/controllers/dashboardController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", requireAuth, requireRole(["ADMIN", "STAFF"]), getDashboardMetrics);
dashboardRoutes.get("/operations", requireAuth, requireRole(["ADMIN", "STAFF"]), getOperationsSummary);
