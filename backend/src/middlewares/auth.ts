import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserStatus } from "@prisma/client";
import { env } from "@/config/env.js";
import { prisma } from "@/lib/prisma.js";
import { getSystemSettings, type SystemSettings } from "@/services/settingsService.js";
import { HttpError } from "@/utils/errors.js";

interface JwtPayload {
  sub: string;
  role: "STUDENT" | "STAFF" | "ADMIN";
  email: string;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.slice("Bearer ".length);
  const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      role: true,
      email: true,
      status: true,
    },
  });

  if (!user) {
    throw new HttpError(401, "User account no longer exists");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new HttpError(403, "User account is disabled");
  }

  req.user = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  next();
}

export function requireRole(roles: Array<"STUDENT" | "STAFF" | "ADMIN">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new HttpError(401, "Unauthenticated request");
    }

    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, "Forbidden");
    }

    next();
  };
}

export function requireStaffPermission(permission: keyof SystemSettings["roles"]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new HttpError(401, "Unauthenticated request");
    }

    if (req.user.role === "ADMIN") {
      next();
      return;
    }

    if (req.user.role !== "STAFF") {
      throw new HttpError(403, "Forbidden");
    }

    const settings = await getSystemSettings();
    if (!settings.roles[permission]) {
      throw new HttpError(403, "Staff permission is disabled in system settings");
    }

    next();
  };
}
