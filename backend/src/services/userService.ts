import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma.js";
import { HttpError } from "@/utils/errors.js";

type UserProjection = {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
  role: UserRole;
  createdAt: Date;
  _count: {
    claims: number;
  };
};

type CreateManagedUserInput = {
  name: string;
  email: string;
  studentId?: string;
  password: string;
  role: UserRole;
};

type UpdateManagedUserInput = {
  userId: string;
  name?: string;
  email?: string;
  studentId?: string | null;
  role?: UserRole;
};

export async function createManagedUser(input: CreateManagedUserInput): Promise<UserProjection> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedStudentId = normalizeStudentId(input.studentId);

  await ensureEmailIsAvailable(normalizedEmail);
  await ensureStudentIdIsAvailable(normalizedStudentId);

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      studentId: normalizedStudentId,
      passwordHash,
      role: input.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      studentId: true,
      role: true,
      createdAt: true,
      _count: {
        select: { claims: true },
      },
    },
  });

  return user;
}

export async function updateManagedUser(input: UpdateManagedUserInput): Promise<UserProjection> {
  const existing = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  const data: {
    name?: string;
    email?: string;
    studentId?: string | null;
    role?: UserRole;
  } = {};

  if (typeof input.name === "string") {
    data.name = input.name.trim();
  }

  if (typeof input.email === "string") {
    const normalizedEmail = input.email.trim().toLowerCase();
    await ensureEmailIsAvailable(normalizedEmail, input.userId);
    data.email = normalizedEmail;
  }

  if (Object.prototype.hasOwnProperty.call(input, "studentId")) {
    const normalizedStudentId = normalizeStudentId(input.studentId);
    await ensureStudentIdIsAvailable(normalizedStudentId, input.userId);
    data.studentId = normalizedStudentId;
  }

  if (input.role) {
    data.role = input.role;
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "No update fields provided");
  }

  const updated = await prisma.user.update({
    where: { id: input.userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      studentId: true,
      role: true,
      createdAt: true,
      _count: {
        select: { claims: true },
      },
    },
  });

  return updated;
}

function normalizeStudentId(studentId: string | null | undefined): string | null {
  if (typeof studentId !== "string") {
    return null;
  }

  const trimmed = studentId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function ensureEmailIsAvailable(email: string, excludeUserId?: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== excludeUserId) {
    throw new HttpError(409, "Email already exists");
  }
}

async function ensureStudentIdIsAvailable(studentId: string | null, excludeUserId?: string): Promise<void> {
  if (!studentId) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { studentId } });
  if (existing && existing.id !== excludeUserId) {
    throw new HttpError(409, "Student ID already exists");
  }
}
