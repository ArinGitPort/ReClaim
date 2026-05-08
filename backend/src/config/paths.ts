import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

// Works both in src/* (tsx dev) and dist/* (node start).
const backendRoot = path.resolve(currentDir, "..", "..");

export const uploadsRoot = path.resolve(backendRoot, "..", "uploads");
export const itemUploadsRoot = path.resolve(uploadsRoot, "items");
export const reportUploadsRoot = path.resolve(uploadsRoot, "reports");
