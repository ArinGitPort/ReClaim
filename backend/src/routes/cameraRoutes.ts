import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { requireAdminPermission, requireAnyAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";
import { createCamera, deleteCamera, getCameras, pingCamera, restartCamera, updateCamera, updateCameraAi, updateCameraStream } from "@/controllers/cameraController.js";

export const cameraRoutes = Router();

cameraRoutes.get(
  "/",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAnyAdminPermission([AdminPermission.LIVE_MONITOR, AdminPermission.CAMERA_SETTINGS]),
  asyncHandler(getCameras)
);

cameraRoutes.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAdminPermission(AdminPermission.CAMERA_SETTINGS),
  asyncHandler(createCamera)
);

cameraRoutes.patch(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAdminPermission(AdminPermission.CAMERA_SETTINGS),
  asyncHandler(updateCamera)
);

cameraRoutes.patch(
  "/:id/ai",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAdminPermission(AdminPermission.CAMERA_SETTINGS),
  asyncHandler(updateCameraAi)
);

cameraRoutes.patch(
  "/:id/stream",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAdminPermission(AdminPermission.CAMERA_SETTINGS),
  asyncHandler(updateCameraStream)
);

cameraRoutes.post(
  "/:id/restart",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAdminPermission(AdminPermission.CAMERA_SETTINGS),
  asyncHandler(restartCamera)
);

cameraRoutes.patch(
  "/:id/ping",
  requireServiceToken,
  asyncHandler(pingCamera)
);

cameraRoutes.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAdminPermission(AdminPermission.CAMERA_SETTINGS),
  asyncHandler(deleteCamera)
);
