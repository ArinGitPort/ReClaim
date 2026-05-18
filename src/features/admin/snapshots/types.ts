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
  }
}

export type ConfidenceFilter = "" | "high" | "medium"
