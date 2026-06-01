import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { getReportMessages, getReports, patchReport, patchReportClose, postReport, postReportEvidence, postReportMessage } from "@/controllers/reportController.js";
import { getReportMatches } from "@/controllers/matchingController.js";
import { requireAdminPermission, requireAuth, requireRole, requireStudentOrAdminPermission } from "@/middlewares/auth.js";
import { reportEvidenceUpload } from "@/middlewares/reportEvidenceUpload.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const reportRoutes = Router();

reportRoutes.use(requireAuth);
reportRoutes.get("/", requireStudentOrAdminPermission(AdminPermission.REPORTS), asyncHandler(getReports));
reportRoutes.post(
	"/upload-evidence",
	requireRole(["STUDENT"]),
	reportEvidenceUpload.array("evidence", 2),
	asyncHandler(postReportEvidence)
);
reportRoutes.post("/", requireRole(["STUDENT"]), asyncHandler(postReport));
reportRoutes.get("/:id/messages", requireStudentOrAdminPermission(AdminPermission.REPORTS), asyncHandler(getReportMessages));
reportRoutes.post("/:id/messages", requireStudentOrAdminPermission(AdminPermission.REPORTS), asyncHandler(postReportMessage));
reportRoutes.get("/:id/matches", requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.REPORTS), asyncHandler(getReportMatches));
reportRoutes.patch("/:id", requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.REPORTS), asyncHandler(patchReport));
reportRoutes.patch("/:id/close", requireRole(["STUDENT"]), asyncHandler(patchReportClose));
