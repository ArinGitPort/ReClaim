import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { itemPhotoUpload } from "@/middlewares/itemPhotoUpload.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";
import { dismissSnapshot, getSnapshots, logSnapshotAsFound, uploadSnapshot } from "@/controllers/snapshotController.js";

export const snapshotRoutes = Router();

snapshotRoutes.post(
  "/",
  requireServiceToken,
  itemPhotoUpload.single("snapshot"),
  asyncHandler(uploadSnapshot)
);

snapshotRoutes.get(
  "/",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(getSnapshots)
);

snapshotRoutes.post(
  "/:id/log-found",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(logSnapshotAsFound)
);

snapshotRoutes.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(dismissSnapshot)
);
