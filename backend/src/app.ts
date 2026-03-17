import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { authRoutes } from "./routes/authRoutes.js";
import { claimRoutes } from "./routes/claimRoutes.js";
import { evidenceRoutes } from "./routes/evidenceRoutes.js";
import { handoverRoutes } from "./routes/handoverRoutes.js";
import { itemRoutes } from "./routes/itemRoutes.js";
import { reportRoutes } from "./routes/reportRoutes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "reclaim-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/handover", handoverRoutes);
app.use("/api/evidence", evidenceRoutes);

app.use(notFound);
app.use(errorHandler);
