import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { reportUploadsRoot } from "@/config/paths.js";
import { MAX_UPLOAD_SIZE_BYTES } from "@/config/constants.js";
import { HttpError } from "@/utils/errors.js";

fs.mkdirSync(reportUploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, reportUploadsRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const token = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${token}${ext}`);
  },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const reportEvidenceUpload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new HttpError(400, "Only JPG, PNG, and WEBP images are allowed"));
  },
});
