import { getImageUrl } from "@/lib/utils"

const attachmentKeys = ["attachments", "referenceAttachments", "referenceAttachment", "evidenceUrls", "mediaUrls"]

export function extractReportAttachmentUrls(proofData?: Record<string, unknown> | null): string[] {
  if (!proofData) return []

  for (const key of attachmentKeys) {
    const value = proofData[key]
    const paths = normalizeAttachmentValue(value)
    if (paths.length > 0) {
      return paths.map((path) => getImageUrl(path)).filter((url): url is string => Boolean(url))
    }
  }

  return []
}

function normalizeAttachmentValue(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()]
  }

  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
}
