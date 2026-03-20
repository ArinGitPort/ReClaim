import { Router } from "express"
import { getUserPickups } from "@/controllers/userController.js"
import { requireAuth, requireRole } from "@/middlewares/auth.js"
import { asyncHandler } from "@/utils/asyncHandler.js"

export const userRoutes = Router()

userRoutes.use(requireAuth, requireRole(["STUDENT"]))
userRoutes.get("/pickups", asyncHandler(getUserPickups))
