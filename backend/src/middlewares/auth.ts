import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env.js";
import { HttpError } from "@/utils/errors.js";

interface JwtPayload {
  sub: string;
  role: "STUDENT" | "STAFF" | "ADMIN";
  email: string;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.slice("Bearer ".length);
  const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

  req.user = {
    id: payload.sub,
    role: payload.role,
    email: payload.email,
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
