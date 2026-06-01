import { AdminPermission, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { normalizeAdminPermissions } from "@/config/adminPermissions.js";
import { prisma } from "@/lib/prisma.js";
import { getSystemSettings } from "@/services/settingsService.js";
import { HttpError } from "@/utils/errors.js";

type UserProjection = {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
  role: UserRole;
  adminPermissions: AdminPermission[];
  status: UserStatus;
  passwordResetRequired: boolean;
  lastLoginAt: Date | null;
  disabledAt: Date | null;
  disabledReason: string | null;
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
  adminPermissions?: AdminPermission[];
};

type UpdateManagedUserInput = {
  userId: string;
  name?: string;
  email?: string;
  studentId?: string | null;
  role?: UserRole;
  adminPermissions?: AdminPermission[];
};

type UpdateAccountStatusInput = {
  userId: string;
  actorUserId: string;
  status: UserStatus;
  disabledReason?: string;
};

export async function createManagedUser(input: CreateManagedUserInput): Promise<UserProjection> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedStudentId = normalizeStudentId(input.studentId);

  await ensureEmailIsAvailable(normalizedEmail);
  await ensureStudentIdIsAvailable(normalizedStudentId);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const adminPermissions = await resolveAdminPermissions(input.role, input.adminPermissions, !Object.prototype.hasOwnProperty.call(input, "adminPermissions"));

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      studentId: normalizedStudentId,
      passwordHash,
      role: input.role,
      adminPermissions,
      passwordResetRequired: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      studentId: true,
      role: true,
      adminPermissions: true,
      status: true,
      passwordResetRequired: true,
      lastLoginAt: true,
      disabledAt: true,
      disabledReason: true,
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
    adminPermissions?: AdminPermission[];
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
    if (existing.role === UserRole.ADMIN && input.role !== UserRole.ADMIN) {
      await ensureAnotherActiveAdminExists(input.userId);
    }
    data.role = input.role;
  }

  const nextRole = input.role ?? existing.role;
  if (Object.prototype.hasOwnProperty.call(input, "adminPermissions") || input.role) {
    data.adminPermissions = await resolveAdminPermissions(
      nextRole,
      input.adminPermissions ?? existing.adminPermissions,
      input.role === UserRole.STAFF && !Object.prototype.hasOwnProperty.call(input, "adminPermissions")
    );
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
      adminPermissions: true,
      status: true,
      passwordResetRequired: true,
      lastLoginAt: true,
      disabledAt: true,
      disabledReason: true,
      createdAt: true,
      _count: {
        select: { claims: true },
      },
    },
  });

  return updated;
}

export async function updateAccountStatus(input: UpdateAccountStatusInput): Promise<UserProjection> {
  const existing = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  if (existing.role === UserRole.ADMIN && input.status !== UserStatus.ACTIVE) {
    await ensureAnotherActiveAdminExists(input.userId);
  }

  const updated = await prisma.user.update({
    where: { id: input.userId },
    data: {
      status: input.status,
      disabledAt: input.status === UserStatus.ACTIVE ? null : new Date(),
      disabledById: input.status === UserStatus.ACTIVE ? null : input.actorUserId,
      disabledReason: input.status === UserStatus.ACTIVE ? null : input.disabledReason?.trim() || "Disabled by administrator",
    },
    select: userProjectionSelect,
  });

  return updated;
}

export async function resetManagedUserPassword(input: {
  userId: string;
  temporaryPassword: string;
}): Promise<UserProjection> {
  const existing = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  const passwordHash = await bcrypt.hash(input.temporaryPassword, 12);
  return prisma.user.update({
    where: { id: input.userId },
    data: {
      passwordHash,
      passwordResetRequired: true,
    },
    select: userProjectionSelect,
  });
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

async function ensureAnotherActiveAdminExists(userId: string): Promise<void> {
  const activeAdminCount = await prisma.user.count({
    where: {
      id: { not: userId },
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  if (activeAdminCount === 0) {
    throw new HttpError(400, "At least one active administrator account is required");
  }
}

const userProjectionSelect = {
  id: true,
  name: true,
  email: true,
  studentId: true,
  role: true,
  adminPermissions: true,
  status: true,
  passwordResetRequired: true,
  lastLoginAt: true,
  disabledAt: true,
  disabledReason: true,
  createdAt: true,
  _count: {
    select: { claims: true },
  },
};

async function resolveAdminPermissions(role: UserRole, permissions?: AdminPermission[], useDefault = false): Promise<AdminPermission[]> {
  if (role !== UserRole.STAFF) {
    return [];
  }

  const normalized = normalizeAdminPermissions(permissions);
  if (!useDefault) {
    return normalized;
  }

  const settings = await getSystemSettings();
  return settings.roles.defaultStaffPermissions;
}
