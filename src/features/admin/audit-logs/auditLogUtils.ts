export function toRecordLabel(targetType: string): string {
  if (targetType === "found_item") return "Found Item"
  if (targetType === "claim") return "Claim"
  if (targetType === "lost_report") return "Lost Report"
  if (targetType === "handover") return "Handover"
  if (targetType === "user") return "User"
  if (targetType === "snapshot") return "AI Snapshot"
  return targetType
}

export function toObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }

  return value as Record<string, unknown>
}

export function stringifyValue(value: unknown): string {
  if (value === null) return "null"
  if (typeof value === "undefined") return "undefined"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return JSON.stringify(value)
}
