import { Router } from "express";
import { postHandover } from "../controllers/handoverController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handoverRoutes = Router();

handoverRoutes.post("/", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(postHandover));
