import { Router } from "express"
import { getUserPickups, postUserPickupReroll, getAllUsers, getUserDetails, patchUser, postUser } from "@/controllers/userController.js"
import { requireAuth, requireRole } from "@/middlewares/auth.js"
import { asyncHandler } from "@/utils/asyncHandler.js"

export const userRoutes = Router()

userRoutes.get("/pickups", requireAuth, requireRole(["STUDENT"]), asyncHandler(getUserPickups))
userRoutes.post("/pickups/:itemId/reroll", requireAuth, requireRole(["STUDENT"]), asyncHandler(postUserPickupReroll))
userRoutes.post("/", requireAuth, requireRole(["ADMIN"]), asyncHandler(postUser))
userRoutes.get("/", requireAuth, requireRole(["STAFF", "ADMIN"]), asyncHandler(getAllUsers))
userRoutes.patch("/:id", requireAuth, requireRole(["ADMIN"]), asyncHandler(patchUser))
userRoutes.get("/:id", requireAuth, requireRole(["STAFF", "ADMIN"]), asyncHandler(getUserDetails))
