import { Router } from "express";
import { getReports, patchReport, postReport } from "@/controllers/reportController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const reportRoutes = Router();

reportRoutes.use(requireAuth);
reportRoutes.get("/", asyncHandler(getReports));
reportRoutes.post("/", requireRole(["STUDENT"]), asyncHandler(postReport));
reportRoutes.patch("/:id", requireRole(["ADMIN", "STAFF"]), asyncHandler(patchReport));
