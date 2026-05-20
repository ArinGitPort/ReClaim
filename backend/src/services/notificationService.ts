import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";

export type NotificationTypeValue = "SYSTEM" | "CLAIM_MESSAGE" | "REPORT_MESSAGE";

type NotificationRecord = {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  route: string | null;
  readAt: Date | null;
  createdAt: Date;
};

const prismaWithNotifications = prisma as typeof prisma & {
  notification: {
    create: (args: unknown) => Promise<NotificationRecord>;
    findMany: (args: unknown) => Promise<NotificationRecord[]>;
    updateMany: (args: unknown) => Promise<{ count: number }>;
  };
};

export async function createNotificationForUser(input: {
  userId: string;
  title: string;
  message: string;
  route?: string;
  type?: NotificationTypeValue;
}) {
  return prismaWithNotifications.notification.create({
    data: {
      userId: input.userId,
      type: input.type ?? "SYSTEM",
      title: input.title,
      message: input.message,
      route: input.route,
    },
  });
}

export async function createNotificationsForRoles(input: {
  roles: UserRole[];
  title: string;
  message: string;
  route?: string;
  type?: NotificationTypeValue;
}) {
  const users = await prisma.user.findMany({
    where: { role: { in: input.roles } },
    select: { id: true },
  });

  if (users.length === 0) {
    return [];
  }

  const created = await Promise.all(
    users.map((user) =>
      prismaWithNotifications.notification.create({
        data: {
          userId: user.id,
          type: input.type ?? "SYSTEM",
          title: input.title,
          message: input.message,
          route: input.route,
        },
      })
    )
  );

  return created;
}

export async function listNotificationsForUser(input: {
  userId: string;
  limit?: number;
}) {
  return prismaWithNotifications.notification.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 100,
  });
}

export async function markNotificationRead(input: {
  notificationId: string;
  userId: string;
}) {
  return prismaWithNotifications.notification.updateMany({
    where: {
      id: input.notificationId,
      userId: input.userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsRead(input: { userId: string; type?: NotificationTypeValue }) {
  return prismaWithNotifications.notification.updateMany({
    where: {
      userId: input.userId,
      readAt: null,
      type: input.type,
    },
    data: {
      readAt: new Date(),
    },
  });
}
