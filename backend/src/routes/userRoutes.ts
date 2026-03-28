import { Router } from "express"
import { getUserPickups, getAllUsers } from "@/controllers/userController.js"
import { requireAuth, requireRole } from "@/middlewares/auth.js"
import { asyncHandler } from "@/utils/asyncHandler.js"

export const userRoutes = Router()

userRoutes.get("/pickups", requireAuth, requireRole(["STUDENT"]), asyncHandler(getUserPickups))
userRoutes.get("/", requireAuth, requireRole(["STAFF", "ADMIN"]), asyncHandler(getAllUsers))
