import type { Request, Response } from "express";
import { z } from "zod";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService.js";

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function getNotifications(req: Request, res: Response): Promise<void> {
  const notifications = await listNotificationsForUser({
    userId: req.user!.id,
  });

  res.json({ notifications });
}

export async function patchNotificationRead(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  await markNotificationRead({
    notificationId: id,
    userId: req.user!.id,
  });

  res.status(204).send();
}

export async function patchNotificationsReadAll(req: Request, res: Response): Promise<void> {
  await markAllNotificationsRead({ userId: req.user!.id });
  res.status(204).send();
}
