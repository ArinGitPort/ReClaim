export type AISnapshot = {
  id: string
  sourceCameraId: string
  snapshotPath: string
  detectedAtUtc: string
  dismissedAt?: string | null
  detectionMeta: {
    category?: string
    confidence?: number
    location?: string
    model?: string
    snapshotType?: string
    stationaryDuration?: number
    personWasNearby?: boolean
    personLeftAt?: string | null
    reason?: string
    duplicateKey?: string
    boundingBox?: {
      x1: number
      y1: number
      x2: number
      y2: number
    }
  }
}

export type ConfidenceFilter = "" | "high" | "medium"
