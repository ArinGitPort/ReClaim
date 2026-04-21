import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma.js";
import { env } from "@/config/env.js";
import { HttpError } from "@/utils/errors.js";

export async function registerUser(input: {
  name: string;
  email: string;
  studentId?: string;
  password: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new HttpError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      studentId: input.studentId ?? null,
      passwordHash,
      role: UserRole.STUDENT,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    role: user.role,
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      role: user.role,
    },
  };
}
