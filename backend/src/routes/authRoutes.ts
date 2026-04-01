import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { login, me, register } from "@/controllers/authController.js";
import { requireAuth } from "@/middlewares/auth.js";

export const authRoutes = Router();

const registerLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many registration attempts. Please try again later." },
});

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many login attempts. Please try again later." },
});

authRoutes.post("/register", registerLimiter, asyncHandler(register));
authRoutes.post("/login", loginLimiter, asyncHandler(login));
authRoutes.get("/me", requireAuth, asyncHandler(me));
