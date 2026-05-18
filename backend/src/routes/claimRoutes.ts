import { Router } from "express";
import { getClaimMessages, getClaims, patchClaimClose, patchClaimDecision, patchClaimProof, postClaim, postClaimMessage } from "@/controllers/claimController.js";
import { requireAuth, requireRole, requireStaffPermission } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const claimRoutes = Router();

claimRoutes.use(requireAuth);
claimRoutes.get("/", asyncHandler(getClaims));
claimRoutes.post("/", requireRole(["STUDENT"]), asyncHandler(postClaim));
claimRoutes.patch("/:id/decision", requireRole(["ADMIN", "STAFF"]), requireStaffPermission("allowStaffManageClaims"), asyncHandler(patchClaimDecision));
claimRoutes.patch("/:id/proof", requireRole(["STUDENT"]), asyncHandler(patchClaimProof));
claimRoutes.patch("/:id/close", requireRole(["STUDENT"]), asyncHandler(patchClaimClose));
claimRoutes.get("/:id/messages", asyncHandler(getClaimMessages));
claimRoutes.post("/:id/messages", asyncHandler(postClaimMessage));
