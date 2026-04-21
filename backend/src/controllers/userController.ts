import { UserRole } from "@prisma/client";
import type { Request, Response } from "express"
import { z } from "zod";
import { prisma } from "@/lib/prisma.js"
import { createManagedUser, updateManagedUser } from "@/services/userService.js";
import { listUserPickups } from "@/services/userPickupService.js"

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  studentId: z.string().trim().optional(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.string().trim().email().optional(),
    studentId: z.string().trim().nullable().optional(),
    role: z.nativeEnum(UserRole).optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one field is required",
  });

export async function getUserPickups(req: Request, res: Response): Promise<void> {
  const pickups = await listUserPickups(req.user!.id)
  res.json({ pickups })
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined
  const role = typeof req.query.role === "string" ? req.query.role : undefined
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
        createdAt: true,
        _count: {
          select: { claims: true }
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where })
  ])

  const pageCount = Math.max(1, Math.ceil(total / limit))

  res.json({
    users,
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      studentId: true,
      role: true,
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
  })

  if (!user) {
    res.status(404).json({ error: "User not found" })
    return
  }

  res.json({ user })
}

export async function postUser(req: Request, res: Response): Promise<void> {
  const body = createUserSchema.parse(req.body);

  const user = await createManagedUser({
    name: body.name,
    email: body.email,
    studentId: body.studentId,
    password: body.password,
    role: body.role,
  });

  res.status(201).json({ user });
}

export async function patchUser(req: Request, res: Response): Promise<void> {
  const { id } = idParamsSchema.parse(req.params);
  const body = updateUserSchema.parse(req.body);

  const user = await updateManagedUser({
    userId: id,
    name: body.name,
    email: body.email,
    studentId: Object.prototype.hasOwnProperty.call(body, "studentId") ? body.studentId : undefined,
    role: body.role,
  });

  res.json({ user });
}
