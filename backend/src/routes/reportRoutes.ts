import { Router } from "express";
import { getReports, patchReport, patchReportClose, postReport, postReportEvidence } from "@/controllers/reportController.js";
import { requireAuth, requireRole, requireStaffPermission } from "@/middlewares/auth.js";
import { reportEvidenceUpload } from "@/middlewares/reportEvidenceUpload.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const reportRoutes = Router();

reportRoutes.use(requireAuth);
reportRoutes.get("/", asyncHandler(getReports));
reportRoutes.post(
	"/upload-evidence",
	requireRole(["STUDENT"]),
	reportEvidenceUpload.array("evidence", 2),
	asyncHandler(postReportEvidence)
);
reportRoutes.post("/", requireRole(["STUDENT"]), asyncHandler(postReport));
reportRoutes.patch("/:id", requireRole(["ADMIN", "STAFF"]), requireStaffPermission("allowStaffViewReports"), asyncHandler(patchReport));
reportRoutes.patch("/:id/close", requireRole(["STUDENT"]), asyncHandler(patchReportClose));
