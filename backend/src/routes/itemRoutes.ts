import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAdminItems, getPublicItems, patchItem, postAiItem, postItem, postItemPhoto } from "@/controllers/itemController.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { itemPhotoUpload } from "@/middlewares/itemPhotoUpload.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";

export const itemRoutes = Router();

itemRoutes.get("/public", asyncHandler(getPublicItems));
itemRoutes.get("/admin", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(getAdminItems));
itemRoutes.post(
	"/upload-photo",
	requireAuth,
	requireRole(["ADMIN", "STAFF"]),
	itemPhotoUpload.single("photo"),
	asyncHandler(postItemPhoto)
);
itemRoutes.patch("/:id", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(patchItem));
itemRoutes.post("/", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(postItem));
itemRoutes.post("/ai-ingest", requireServiceToken, asyncHandler(postAiItem));
