import { Router } from "express";
import { getReportMessages, getReports, patchReport, patchReportClose, postReport, postReportEvidence, postReportMessage } from "@/controllers/reportController.js";
import { getReportMatches } from "@/controllers/matchingController.js";
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
reportRoutes.get("/:id/messages", asyncHandler(getReportMessages));
reportRoutes.post("/:id/messages", asyncHandler(postReportMessage));
reportRoutes.get("/:id/matches", requireRole(["ADMIN", "STAFF"]), requireStaffPermission("allowStaffViewReports"), asyncHandler(getReportMatches));
reportRoutes.patch("/:id", requireRole(["ADMIN", "STAFF"]), requireStaffPermission("allowStaffViewReports"), asyncHandler(patchReport));
reportRoutes.patch("/:id/close", requireRole(["STUDENT"]), asyncHandler(patchReportClose));
