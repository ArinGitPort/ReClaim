import type { AISnapshot } from "@/features/admin/snapshots"
export type { CampusCamera } from "@/features/admin/cameras/types"

export type LiveMonitorViewMode = "grid" | "focus"

export type RecentSnapshot = AISnapshot

export type AiServiceStatus = {
  running: boolean
  managed: boolean
  pid: number | null
  streamBaseUrl: string
  activeCameras: string[]
  model: string | null
  device: string | null
  cudaAvailable: boolean | null
  error?: string
}
