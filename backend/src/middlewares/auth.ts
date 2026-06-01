import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AdminPermission, UserStatus } from "@prisma/client";
import { env } from "@/config/env.js";
import { prisma } from "@/lib/prisma.js";
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
      adminPermissions: true,
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
    adminPermissions: user.role === "STAFF" ? user.adminPermissions : [],
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

export function requireAdminPermission(permission: AdminPermission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
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

    if (!req.user.adminPermissions.includes(permission)) {
      throw new HttpError(403, "Staff account does not have permission for this admin action");
    }

    next();
  };
}

export function requireStudentOrAdminPermission(permission: AdminPermission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new HttpError(401, "Unauthenticated request");
    }

    if (req.user.role === "STUDENT") {
      next();
      return;
    }

    return requireAdminPermission(permission)(req, _res, next);
  };
}

export function requireAnyAdminPermission(permissions: AdminPermission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
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

    if (!permissions.some((permission) => req.user!.adminPermissions.includes(permission))) {
      throw new HttpError(403, "Staff account does not have permission for this admin action");
    }

    next();
  };
}
