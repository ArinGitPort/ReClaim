import { UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { loginUser, registerUser } from "../services/authService.js";
import { logAudit } from "../services/auditService.js";
import { HttpError } from "../utils/errors.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  studentId: z.string().optional(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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
      role: true,
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({ user });
}
