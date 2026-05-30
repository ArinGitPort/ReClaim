export type CampusCamera = {
  id: string
  code: string
  name: string
  location: string
  sourceUrl: string
  isOnline: boolean
  streamEnabled: boolean
  aiEnabled: boolean
  aiConfThreshold?: number
  aiFrameSkip?: number
  streamStatus?: CameraStreamStatus
  lastFrameAtUtc?: string | null
  lastError?: string | null
  lastPingAtUtc: string | null
}

export type CameraStreamStatus = "CONNECTING" | "ONLINE" | "OFFLINE" | "SOURCE_IN_USE" | "ERROR"
