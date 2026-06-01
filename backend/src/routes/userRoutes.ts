import { Router } from "express"
import { AdminPermission } from "@prisma/client"
import { getUserPickups, postUserPickupReroll, getAllUsers, getUserDetails, patchUser, patchUserStatus, postUser, postUserPasswordReset } from "@/controllers/userController.js"
import { requireAdminPermission, requireAuth, requireRole } from "@/middlewares/auth.js"
import { asyncHandler } from "@/utils/asyncHandler.js"

export const userRoutes = Router()

userRoutes.get("/pickups", requireAuth, requireRole(["STUDENT"]), asyncHandler(getUserPickups))
userRoutes.post("/pickups/:itemId/reroll", requireAuth, requireRole(["STUDENT"]), asyncHandler(postUserPickupReroll))
userRoutes.post("/", requireAuth, requireRole(["ADMIN"]), asyncHandler(postUser))
userRoutes.get("/", requireAuth, requireRole(["STAFF", "ADMIN"]), requireAdminPermission(AdminPermission.USER_DIRECTORY), asyncHandler(getAllUsers))
userRoutes.patch("/:id/status", requireAuth, requireRole(["ADMIN"]), asyncHandler(patchUserStatus))
userRoutes.post("/:id/password-reset", requireAuth, requireRole(["ADMIN"]), asyncHandler(postUserPasswordReset))
userRoutes.patch("/:id", requireAuth, requireRole(["ADMIN"]), asyncHandler(patchUser))
userRoutes.get("/:id", requireAuth, requireRole(["STAFF", "ADMIN"]), requireAdminPermission(AdminPermission.USER_DIRECTORY), asyncHandler(getUserDetails))
