import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "@/config/env.js";
import { uploadsRoot } from "@/config/paths.js";
import { errorHandler } from "@/middlewares/errorHandler.js";
import { notFound } from "@/middlewares/notFound.js";
import { auditRoutes } from "@/routes/auditRoutes.js";
import { authRoutes } from "@/routes/authRoutes.js";
import { claimRoutes } from "@/routes/claimRoutes.js";
import { evidenceRoutes } from "@/routes/evidenceRoutes.js";
import { handoverRoutes } from "@/routes/handoverRoutes.js";
import { itemRoutes } from "@/routes/itemRoutes.js";
import { notificationRoutes } from "@/routes/notificationRoutes.js";
import { reportRoutes } from "@/routes/reportRoutes.js";
import { userRoutes } from "@/routes/userRoutes.js";
import { dashboardRoutes } from "@/routes/dashboardRoutes.js";
import { snapshotRoutes } from "@/routes/snapshotRoutes.js";
import { cameraRoutes } from "@/routes/cameraRoutes.js";
import { settingsRoutes } from "@/routes/settingsRoutes.js";
import { aiServiceRoutes } from "@/routes/aiServiceRoutes.js";

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isConfiguredOrigin = origin === env.frontendOrigin;
      const isLocalDevOrigin = /^http:\/\/localhost:\d+$/.test(origin);

      if (isConfiguredOrigin || isLocalDevOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsRoot));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "reclaim-backend" });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "ReClaim API is running",
    routes: {
      auth: "/api/auth",
      items: "/api/items",
      claims: "/api/claims",
      reports: "/api/reports",
      user: "/api/user",
      notifications: "/api/notifications",
      handover: "/api/handover",
      evidence: "/api/evidence",
      audit: "/api/audit",
      dashboard: "/api/dashboard",
      snapshots: "/api/snapshots",
      cameras: "/api/cameras",
      settings: "/api/settings",
      aiService: "/api/ai-service",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/handover", handoverRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/snapshots", snapshotRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai-service", aiServiceRoutes);

app.use(notFound);
app.use(errorHandler);
