import type { AISnapshot, ConfidenceFilter } from "./types"

export function getSnapshotCategory(snapshot: AISnapshot) {
  return snapshot.detectionMeta?.category || "Unknown"
}

export function getSnapshotLocation(snapshot: AISnapshot) {
  return snapshot.detectionMeta?.location || snapshot.sourceCameraId
}

export function getSnapshotConfidence(snapshot: AISnapshot) {
  return Math.round((snapshot.detectionMeta?.confidence || 0) * 100)
}

export function getConfidenceBadgeClass(confidence: number) {
  if (confidence >= 90) return "bg-green-50 text-green-700 border-green-200"
  if (confidence >= 75) return "bg-blue-50 text-blue-700 border-blue-200"
  return "bg-amber-50 text-amber-700 border-amber-200"
}

export function getSnapshotReasonLabels(snapshot: AISnapshot): string[] {
  const meta = snapshot.detectionMeta ?? {}
  const labels: string[] = []

  if (typeof meta.stationaryDuration === "number") {
    labels.push(`Stationary for ${Math.round(meta.stationaryDuration)}s`)
  }
  if (meta.personWasNearby) {
    labels.push("Person moved away")
  }
  if (meta.zoneName) {
    labels.push(`Zone: ${meta.zoneName}`)
  }
  if (meta.reason && labels.length === 0) {
    labels.push(...meta.reason.split("/").map((part) => part.trim()).filter(Boolean))
  }

  return labels.slice(0, 4)
}

export function filterSnapshots(
  snapshots: AISnapshot[],
  searchQuery: string,
  locationFilter: string,
  confidenceFilter: ConfidenceFilter,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase()

  return snapshots.filter((snapshot) => {
    const category = getSnapshotCategory(snapshot)
    const location = getSnapshotLocation(snapshot)
    const confidence = getSnapshotConfidence(snapshot)

    if (normalizedSearch && !category.toLowerCase().includes(normalizedSearch)) return false
    if (locationFilter && location !== locationFilter) return false
    if (confidenceFilter === "high" && confidence < 90) return false
    if (confidenceFilter === "medium" && confidence < 75) return false

    return true
  })
}
