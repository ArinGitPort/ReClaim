import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { itemPhotoUpload } from "@/middlewares/itemPhotoUpload.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";
import { dismissSnapshot, getDismissedSnapshots, getSnapshots, logSnapshotAsFound, restoreSnapshot, uploadSnapshot, batchDismissSnapshots, batchLogSnapshotsAsFound } from "@/controllers/snapshotController.js";

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

snapshotRoutes.get(
  "/dismissed",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(getDismissedSnapshots)
);

snapshotRoutes.post(
  "/batch-dismiss",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(batchDismissSnapshots)
);

snapshotRoutes.post(
  "/batch-log-found",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(batchLogSnapshotsAsFound)
);

snapshotRoutes.post(
  "/:id/log-found",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(logSnapshotAsFound)
);

snapshotRoutes.post(
  "/:id/restore",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(restoreSnapshot)
);

snapshotRoutes.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(dismissSnapshot)
);
