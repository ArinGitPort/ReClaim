import fs from "node:fs";
import multer from "multer";
import { itemUploadsRoot } from "@/config/paths.js";
import { MAX_UPLOAD_SIZE_BYTES } from "@/config/constants.js";
import { HttpError } from "@/utils/errors.js";

fs.mkdirSync(itemUploadsRoot, { recursive: true });

const mimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, itemUploadsRoot);
  },
  filename: (_req, file, cb) => {
    const ext = mimeToExtension[file.mimetype];
    if (!ext) {
      cb(new HttpError(400, "Only JPG, PNG, and WEBP images are allowed"), "");
      return;
    }

    const token = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${token}${ext}`);
  },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const itemPhotoUpload = multer({
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
