import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { login, me, register } from "@/controllers/authController.js";
import { requireAuth } from "@/middlewares/auth.js";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(register));
authRoutes.post("/login", asyncHandler(login));
authRoutes.get("/me", requireAuth, asyncHandler(me));
