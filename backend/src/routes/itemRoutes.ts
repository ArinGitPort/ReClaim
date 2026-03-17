import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAdminItems, getPublicItems, postAiItem, postItem } from "../controllers/itemController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { requireServiceToken } from "../middlewares/serviceAuth.js";

export const itemRoutes = Router();

itemRoutes.get("/public", asyncHandler(getPublicItems));
itemRoutes.get("/admin", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(getAdminItems));
itemRoutes.post("/", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(postItem));
itemRoutes.post("/ai-ingest", requireServiceToken, asyncHandler(postAiItem));
