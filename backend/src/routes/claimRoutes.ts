import { Router } from "express";
import { getClaims, patchClaimClose, patchClaimDecision, patchClaimProof, postClaim } from "@/controllers/claimController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const claimRoutes = Router();

claimRoutes.use(requireAuth);
claimRoutes.get("/", asyncHandler(getClaims));
claimRoutes.post("/", requireRole(["STUDENT"]), asyncHandler(postClaim));
claimRoutes.patch("/:id/decision", requireRole(["ADMIN", "STAFF"]), asyncHandler(patchClaimDecision));
claimRoutes.patch("/:id/proof", requireRole(["STUDENT"]), asyncHandler(patchClaimProof));
claimRoutes.patch("/:id/close", requireRole(["STUDENT"]), asyncHandler(patchClaimClose));
