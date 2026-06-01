import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { getClaimMessages, getClaims, patchClaimClose, patchClaimDecision, patchClaimProof, postClaim, postClaimMessage } from "@/controllers/claimController.js";
import { requireAdminPermission, requireAuth, requireRole, requireStudentOrAdminPermission } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const claimRoutes = Router();

claimRoutes.use(requireAuth);
claimRoutes.get("/", requireRole(["STUDENT", "ADMIN", "STAFF"]), requireStudentOrAdminPermission(AdminPermission.CLAIMS), asyncHandler(getClaims));
claimRoutes.post("/", requireRole(["STUDENT"]), asyncHandler(postClaim));
claimRoutes.patch("/:id/decision", requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.CLAIMS), asyncHandler(patchClaimDecision));
claimRoutes.patch("/:id/proof", requireRole(["STUDENT"]), asyncHandler(patchClaimProof));
claimRoutes.patch("/:id/close", requireRole(["STUDENT"]), asyncHandler(patchClaimClose));
claimRoutes.get("/:id/messages", requireStudentOrAdminPermission(AdminPermission.CLAIMS), asyncHandler(getClaimMessages));
claimRoutes.post("/:id/messages", requireStudentOrAdminPermission(AdminPermission.CLAIMS), asyncHandler(postClaimMessage));
