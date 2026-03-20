import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { HttpError } from "@/utils/errors.js";

const uploadsDir = path.resolve(process.cwd(), "..", "uploads", "items");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const token = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${token}${ext}`);
  },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const itemPhotoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new HttpError(400, "Only JPG, PNG, and WEBP images are allowed"));
  },
});
