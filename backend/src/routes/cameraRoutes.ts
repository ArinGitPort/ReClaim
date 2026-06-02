import { Router } from "express";
import { AdminPermission } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { requireAdminPermission, requireAnyAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";
import { createCamera, deleteCamera, getCameraSources, getCameras, pingCamera, restartCamera, updateCamera, updateCameraAi, updateCameraStream } from "@/controllers/cameraController.js";

export const cameraRoutes = Router();

cameraRoutes.get(
  "/",
  allowServiceTokenOrCameraAccess,
  asyncHandler(getCameras)
);

cameraRoutes.get(
  "/sources",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  requireAdminPermission(AdminPermission.CAMERA_SETTINGS),
  asyncHandler(getCameraSources)
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

function allowServiceTokenOrCameraAccess(req: Request, res: Response, next: NextFunction): void {
  if (req.header("x-service-token")) {
    requireServiceToken(req, res, next);
    return;
  }

  void requireAuth(req, res, () => {
    requireRole(["ADMIN", "STAFF"])(req, res, () => {
      requireAnyAdminPermission([AdminPermission.LIVE_MONITOR, AdminPermission.CAMERA_SETTINGS])(req, res, next);
    });
  });
}
