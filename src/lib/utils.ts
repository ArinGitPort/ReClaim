import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

export function getAssetBaseUrl(): string {
  return API_BASE_URL.replace(/\/api\/?$/, "")
}

export function getImageUrl(path?: string | null): string | undefined {
  if (!path) {
    return undefined
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const origin = getAssetBaseUrl()
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`
}
