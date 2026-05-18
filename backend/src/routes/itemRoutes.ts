import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getAdminItems, getPublicItems, patchItem, postAiItem, postItem, postItemPhoto, batchDisposeItems } from "@/controllers/itemController.js";
import { requireAuth, requireRole, requireStaffPermission } from "@/middlewares/auth.js";
import { itemPhotoUpload } from "@/middlewares/itemPhotoUpload.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";

export const itemRoutes = Router();

itemRoutes.get("/public", asyncHandler(getPublicItems));
itemRoutes.get("/admin", requireAuth, requireRole(["ADMIN", "STAFF"]), asyncHandler(getAdminItems));
itemRoutes.post(
	"/upload-photo",
	requireAuth,
	requireRole(["ADMIN", "STAFF"]),
	requireStaffPermission("allowStaffManageInventory"),
	itemPhotoUpload.single("photo"),
	asyncHandler(postItemPhoto)
);
itemRoutes.patch("/:id", requireAuth, requireRole(["ADMIN", "STAFF"]), requireStaffPermission("allowStaffManageInventory"), asyncHandler(patchItem));
itemRoutes.post("/", requireAuth, requireRole(["ADMIN", "STAFF"]), requireStaffPermission("allowStaffManageInventory"), asyncHandler(postItem));
itemRoutes.post("/ai-ingest", requireServiceToken, asyncHandler(postAiItem));

itemRoutes.post("/batch-dispose", requireAuth, requireRole(["ADMIN", "STAFF"]), requireStaffPermission("allowStaffManageInventory"), asyncHandler(batchDisposeItems));
