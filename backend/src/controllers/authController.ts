import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { loginUser, registerUser } from "@/services/authService.js";
import { logAudit } from "@/services/auditService.js";
import { HttpError } from "@/utils/errors.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  studentId: z.string().optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const profileSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().max(40).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  notificationPreferences: z
    .object({
      claimUpdates: z.boolean(),
      reportUpdates: z.boolean(),
      pickupReminders: z.boolean(),
    })
    .optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export async function register(req: Request, res: Response): Promise<void> {
  const body = registerSchema.parse(req.body);
  const user = await registerUser(body);

  await logAudit({
    actorUserId: user.id,
    action: "AUTH_LOGIN",
    targetType: "user",
    targetId: user.id,
    description: "User registered",
    targetReferenceCode: user.studentId ?? user.email,
    payload: {
      targetReferenceCode: user.studentId ?? user.email,
    },
  });

  res.status(201).json({ user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);
  const result = await loginUser(body);

  await logAudit({
    actorUserId: result.user.id,
    action: "AUTH_LOGIN",
    targetType: "user",
    targetId: result.user.id,
    description: "User logged in",
    targetReferenceCode: result.user.email,
    payload: {
      targetReferenceCode: result.user.email,
    },
  });

  res.json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "Unauthenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      studentId: true,
      phone: true,
      department: true,
      notificationPreferences: true,
      role: true,
      adminPermissions: true,
      status: true,
      passwordResetRequired: true,
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({ user });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "Unauthenticated");
  }

  const body = profileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name: body.name,
      phone: body.phone?.trim() || null,
      department: body.department?.trim() || null,
      notificationPreferences: body.notificationPreferences as Prisma.InputJsonValue | undefined,
    },
    select: profileSelect,
  });

  res.json({ user });
}

export async function updatePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "Unauthenticated");
  }

  const body = passwordSchema.parse(req.body);
  if (body.currentPassword === body.newPassword) {
    throw new HttpError(400, "New password must be different from the current password");
  }

  const existing = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { passwordHash: true },
  });

  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  const matches = await bcrypt.compare(body.currentPassword, existing.passwordHash);
  if (!matches) {
    throw new HttpError(400, "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(body.newPassword, 12);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      passwordHash,
      passwordResetRequired: false,
    },
    select: profileSelect,
  });

  res.json({ user });
}

const profileSelect = {
  id: true,
  name: true,
  email: true,
  studentId: true,
  phone: true,
  department: true,
  notificationPreferences: true,
  role: true,
  adminPermissions: true,
  status: true,
  passwordResetRequired: true,
};
