import { AdminPermission, AuditAction, UserRole, UserStatus } from "@prisma/client";
import type { Request, Response } from "express"
import { z } from "zod";
import { hasDuplicateAdminPermissions } from "@/config/adminPermissions.js";
import { prisma } from "@/lib/prisma.js"
import { createManagedUser, resetManagedUserPassword, updateAccountStatus, updateManagedUser } from "@/services/userService.js";
import { listUserPickups, rerollPickupToken } from "@/services/userPickupService.js"
import { logAudit } from "@/services/auditService.js";

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  studentId: z.string().trim().optional(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  adminPermissions: z.array(z.nativeEnum(AdminPermission)).optional(),
}).superRefine((value, ctx) => {
  validateManagedStaffPermissions(value.role, value.adminPermissions, ctx);
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.string().trim().email().optional(),
    studentId: z.string().trim().nullable().optional(),
    role: z.nativeEnum(UserRole).optional(),
    adminPermissions: z.array(z.nativeEnum(AdminPermission)).optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one field is required",
  })
  .superRefine((value, ctx) => {
    if (value.role) {
      validateManagedStaffPermissions(value.role, value.adminPermissions, ctx);
    }
    if (value.adminPermissions && hasDuplicateAdminPermissions(value.adminPermissions)) {
      ctx.addIssue({
        code: "custom",
        path: ["adminPermissions"],
        message: "Staff permissions cannot contain duplicates",
      });
    }
  });

const accountStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED", "SUSPENDED"]),
  reason: z.string().trim().optional(),
});

const resetPasswordSchema = z.object({
  temporaryPassword: z.string().min(8).optional(),
});

export async function getUserPickups(req: Request, res: Response): Promise<void> {
  const pickups = await listUserPickups(req.user!.id)
  res.json({ pickups })
}

export async function postUserPickupReroll(req: Request, res: Response): Promise<void> {
  const itemId = req.params.itemId as string;
  const newToken = await rerollPickupToken(req.user!.id, itemId)
  res.json({ pickupToken: newToken })
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined
  const role = typeof req.query.role === "string" ? req.query.role : undefined
  const status = typeof req.query.status === "string" ? req.query.status : undefined
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25))
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt"
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc"
  const skip = (page - 1) * limit
  
  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { studentId: { contains: search, mode: "insensitive" } }
    ]
  }
  
  if (role) {
    where.role = role
  }

  if (status && Object.values(UserStatus).includes(status as UserStatus)) {
    where.status = status
  }
  
  let orderBy: any = { createdAt: sortOrder }

  if (sortBy === "name") {
    orderBy = { name: sortOrder }
  } else if (sortBy === "email") {
    orderBy = { email: sortOrder }
  } else if (sortBy === "role") {
    orderBy = { role: sortOrder }
  } else if (sortBy === "claims") {
    orderBy = { claims: { _count: sortOrder } }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
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
        reports: {
          select: {
            status: true,
          },
        },
        claims: {
          select: {
            status: true,
            foundItem: {
              select: {
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            claims: true,
            reports: true,
            handovers: true,
          }
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where })
  ])

  const pageCount = Math.max(1, Math.ceil(total / limit))

  const mappedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    role: user.role,
    adminPermissions: user.adminPermissions,
    status: user.status,
    passwordResetRequired: user.passwordResetRequired,
    lastLoginAt: user.lastLoginAt,
    disabledAt: user.disabledAt,
    disabledReason: user.disabledReason,
    createdAt: user.createdAt,
    _count: user._count,
    metrics: {
      pendingClaims: user.claims.filter((claim) => claim.status === "PENDING_VERIFICATION" || claim.status === "INQUIRY_REQUIRED").length,
      activeReports: user.reports.filter((report) => report.status === "SUBMITTED" || report.status === "UNDER_REVIEW" || report.status === "ACTIVE_SEARCH" || report.status === "MATCHED").length,
      returnedItems: user._count.handovers,
      activeClaims: user.claims.filter((claim) => (
        claim.status === "PENDING_VERIFICATION" ||
        claim.status === "INQUIRY_REQUIRED" ||
        (claim.status === "APPROVED" && claim.foundItem.status !== "RETURNED")
      )).length,
    },
  }))

  res.json({
    users: mappedUsers,
    pagination: {
      page,
      limit,
      total,
      pageCount,
    }
  })
}

export async function getUserDetails(req: Request, res: Response): Promise<void> {
  const { id: userId } = idParamsSchema.parse(req.params)

  const [user, auditLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
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
        claims: {
          include: { foundItem: true },
          orderBy: { createdAt: 'desc' }
        },
        reports: {
          orderBy: { createdAt: 'desc' }
        },
        handovers: {
          include: { foundItem: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.auditLog.findMany({
      where: {
        OR: [
          { actorUserId: userId },
          { targetType: "user", targetId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actorUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    }),
  ])

  if (!user) {
    res.status(404).json({ error: "User not found" })
    return
  }

  res.json({ user: { ...user, auditLogs } })
}

export async function postUser(req: Request, res: Response): Promise<void> {
  const body = createUserSchema.parse(req.body);

  const user = await createManagedUser({
    name: body.name,
    email: body.email,
    studentId: body.studentId,
    password: body.password,
    role: body.role,
    adminPermissions: body.adminPermissions,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.USER_CREATED,
    targetType: "user",
    targetId: user.id,
    description: "Admin created a user account",
    targetReferenceCode: user.email,
    payload: {
      targetReferenceCode: user.email,
      role: user.role,
    },
  });

  res.status(201).json({ user });
}

export async function patchUser(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = updateUserSchema.parse(req.body);

  const beforeUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true, email: true },
  });

  const user = await updateManagedUser({
    userId: id,
    name: body.name,
    email: body.email,
    studentId: Object.prototype.hasOwnProperty.call(body, "studentId") ? body.studentId : undefined,
    role: body.role,
    adminPermissions: body.adminPermissions,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: beforeUser?.role && body.role && beforeUser.role !== body.role ? AuditAction.USER_ROLE_CHANGED : AuditAction.USER_UPDATED,
    targetType: "user",
    targetId: user.id,
    description: beforeUser?.role && body.role && beforeUser.role !== body.role
      ? `Admin changed user role from ${beforeUser.role} to ${body.role}`
      : "Admin updated user profile",
    targetReferenceCode: user.email,
    payload: {
      targetReferenceCode: user.email,
      beforeRole: beforeUser?.role,
      afterRole: user.role,
      adminPermissions: user.adminPermissions,
    },
  });

  res.json({ user });
}

export async function patchUserStatus(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = accountStatusSchema.parse(req.body);

  if (id === req.user!.id && body.status !== "ACTIVE") {
    res.status(400).json({ error: "You cannot disable or suspend your own administrator account" });
    return;
  }

  const user = await updateAccountStatus({
    userId: id,
    actorUserId: req.user!.id,
    status: body.status as UserStatus,
    disabledReason: body.reason,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: user.status === "ACTIVE" ? AuditAction.USER_ENABLED : AuditAction.USER_DISABLED,
    targetType: "user",
    targetId: user.id,
    description: user.status === "ACTIVE" ? "Admin enabled user account" : `Admin set user account to ${user.status}`,
    targetReferenceCode: user.email,
    payload: {
      targetReferenceCode: user.email,
      status: user.status,
      reason: user.disabledReason,
    },
  });

  res.json({ user });
}

export async function postUserPasswordReset(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = resetPasswordSchema.parse(req.body);
  const temporaryPassword = body.temporaryPassword ?? createTemporaryPassword();

  const user = await resetManagedUserPassword({
    userId: id,
    temporaryPassword,
  });

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.USER_PASSWORD_RESET,
    targetType: "user",
    targetId: user.id,
    description: "Admin reset user password",
    targetReferenceCode: user.email,
    payload: {
      targetReferenceCode: user.email,
      passwordResetRequired: true,
    },
  });

  res.json({
    user,
    temporaryPassword,
  });
}

function createTemporaryPassword(): string {
  return `ReClaim-${Math.random().toString(36).slice(2, 8).toUpperCase()}!`;
}

function validateManagedStaffPermissions(
  role: UserRole,
  adminPermissions: AdminPermission[] | undefined,
  ctx: z.RefinementCtx
) {
  if (adminPermissions && hasDuplicateAdminPermissions(adminPermissions)) {
    ctx.addIssue({
      code: "custom",
      path: ["adminPermissions"],
      message: "Staff permissions cannot contain duplicates",
    });
  }

  if (role === UserRole.STAFF && adminPermissions && adminPermissions.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["adminPermissions"],
      message: "A staff account must have at least one admin permission",
    });
  }
}
