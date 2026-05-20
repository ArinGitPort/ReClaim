import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { requireAuth, requireRole } from "@/middlewares/auth.js";
import { requireServiceToken } from "@/middlewares/serviceAuth.js";
import { createCamera, deleteCamera, getCameras, pingCamera, restartCamera, updateCamera, updateCameraAi, updateCameraStream } from "@/controllers/cameraController.js";

export const cameraRoutes = Router();

cameraRoutes.get(
  "/",
  asyncHandler(getCameras)
);

cameraRoutes.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(createCamera)
);

cameraRoutes.patch(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(updateCamera)
);

cameraRoutes.patch(
  "/:id/ai",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(updateCameraAi)
);

cameraRoutes.patch(
  "/:id/stream",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
  asyncHandler(updateCameraStream)
);

cameraRoutes.post(
  "/:id/restart",
  requireAuth,
  requireRole(["ADMIN", "STAFF"]),
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
  asyncHandler(deleteCamera)
);
