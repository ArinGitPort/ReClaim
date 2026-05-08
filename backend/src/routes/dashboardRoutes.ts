import { Router } from "express";
import { getDashboardMetrics } from "@/controllers/dashboardController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";

export const dashboardRoutes = Router();

// Allow internal admin route
dashboardRoutes.get("/", requireAuth, requireRole(["ADMIN"]), getDashboardMetrics);
