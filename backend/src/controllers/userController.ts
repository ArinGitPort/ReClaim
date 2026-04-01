import type { Request, Response } from "express"
import { prisma } from "@/lib/prisma.js"
import { listUserPickups } from "@/services/userPickupService.js"

export async function getUserPickups(req: Request, res: Response): Promise<void> {
  const pickups = await listUserPickups(req.user!.id)
  res.json({ pickups })
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined
  const role = typeof req.query.role === "string" ? req.query.role : undefined
  
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
  
  const users = await prisma.user.findMany({
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
    orderBy: {
      createdAt: "desc"
    }
  })

  res.json({ users })
}

export async function getUserDetails(req: Request, res: Response): Promise<void> {
  const userId = req.params.id as string

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
