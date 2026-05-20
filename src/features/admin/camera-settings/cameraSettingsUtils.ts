import type { CameraStreamStatus } from "@/features/admin/cameras/types"

export function formatLastCameraPing(utcStr: string | null, isOnline = false) {
  if (!utcStr) return isOnline ? "Awaiting first ping" : "Not connected yet"

  const diffSeconds = Math.floor((Date.now() - new Date(utcStr).getTime()) / 1000)
  if (diffSeconds < 60) return `Active ${diffSeconds}s ago`

  const diffMins = Math.floor(diffSeconds / 60)
  if (diffMins < 60) return `Active ${diffMins}m ago`

  return `Offline for ${Math.floor(diffMins / 60)}h`
}

export function getCameraStatusLabel(status?: CameraStreamStatus, isOnline = false) {
  if (status === "SOURCE_IN_USE") return "Source in use"
  if (status === "ERROR") return "Error"
  if (status === "CONNECTING") return "Connecting"
  if (status === "ONLINE" || isOnline) return "Online"
  return "Offline"
}

export function getCameraStatusClass(status?: CameraStreamStatus, isOnline = false) {
  if (status === "ONLINE" || isOnline) return "bg-green-50 text-green-700 border-green-200"
  if (status === "CONNECTING") return "bg-amber-50 text-amber-700 border-amber-200"
  if (status === "SOURCE_IN_USE" || status === "ERROR") return "bg-rose-50 text-rose-700 border-rose-200"
  return "bg-slate-50 text-slate-600 border-slate-200"
}

export function getCameraStatusDotClass(status?: CameraStreamStatus, isOnline = false) {
  if (status === "ONLINE" || isOnline) return "bg-green-500"
  if (status === "CONNECTING") return "bg-amber-500 animate-pulse"
  if (status === "SOURCE_IN_USE" || status === "ERROR") return "bg-rose-500"
  return "bg-slate-400"
}

export function cameraMatchesSearch(camera: { name: string; code: string; location: string }, searchQuery: string) {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return true

  return (
    camera.name.toLowerCase().includes(query) ||
    camera.code.toLowerCase().includes(query) ||
    camera.location.toLowerCase().includes(query)
  )
}
