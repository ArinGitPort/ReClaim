import { Router } from "express";
import {
  getNotifications,
  patchNotificationRead,
  patchNotificationsReadAll,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get("/", asyncHandler(getNotifications));
notificationRoutes.patch("/:id/read", asyncHandler(patchNotificationRead));
notificationRoutes.patch("/read-all", asyncHandler(patchNotificationsReadAll));
