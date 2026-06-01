import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAdminItems, getPublicItems, patchItem, postAiItem, postItem, postItemPhoto, batchDisposeItems, deleteItem } from "@/controllers/itemController.js";
import { requireAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";
import { itemPhotoUpload } from "@/middlewares/itemPhotoUpload.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";

export const itemRoutes = Router();

itemRoutes.get("/public", asyncHandler(getPublicItems));
itemRoutes.get("/admin", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.INVENTORY), asyncHandler(getAdminItems));
itemRoutes.post(
	"/upload-photo",
	requireAuth,
	requireRole(["ADMIN", "STAFF"]),
	requireAdminPermission(AdminPermission.INVENTORY),
	itemPhotoUpload.single("photo"),
	asyncHandler(postItemPhoto)
);
itemRoutes.patch("/:id", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.INVENTORY), asyncHandler(patchItem));
itemRoutes.delete("/:id", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.INVENTORY), asyncHandler(deleteItem));
itemRoutes.post("/", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.INVENTORY), asyncHandler(postItem));
itemRoutes.post("/ai-ingest", requireServiceToken, asyncHandler(postAiItem));

itemRoutes.post("/batch-dispose", requireAuth, requireRole(["ADMIN", "STAFF"]), requireAdminPermission(AdminPermission.INVENTORY), asyncHandler(batchDisposeItems));
