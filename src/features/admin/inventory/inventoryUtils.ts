import { getImageUrl } from "@/lib/utils"
import { formatShortDate } from "@/lib/formatters"
import type { InventoryRow } from "./types"

export function inventoryNextAction(item: InventoryRow): string | null {
  if (item.status === "AVAILABLE") return null
  if (item.isHandoverReady) return "Ready for Handover"
  if (item.status === "CLAIM_PENDING") return "Reserved"
  if (item.status === "ARCHIVED") return "Deleted"
  return item.status.replaceAll("_", " ")
}

export function mapInventoryRow(item: ApiInventoryItem): InventoryRow {
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    category: item.category,
    color: item.color,
    foundAtUtc: item.foundAtUtc,
    foundLocation: item.foundLocation,
    date: formatShortDate(item.foundAtUtc),
    location: item.foundLocation,
    status: item.status,
    storage: item.storageLocation ?? "Not assigned",
    isHandoverReady: Boolean(item.isHandoverReady),
    handoverClaim: item.handoverClaim ?? null,
    privateDiscoveryNote: item.privateDiscoveryNote ?? undefined,
    photoUrl: getImageUrl(extractPhotoPath(item.privateData) ?? item.aiEvidenceLogs?.[0]?.snapshotPath),
    claimProfile: extractClaimProfile(item.privateData),
  }
}

export type ApiInventoryItem = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundAtUtc: string
  foundLocation: string
  status: string
  storageLocation?: string | null
  privateDiscoveryNote?: string | null
  privateData?: unknown
  isHandoverReady?: boolean
  handoverClaim?: {
    id: string
    claimCode: string
    pickupTokenExpires?: string | null
    claimantUserId: string
  } | null
  aiEvidenceLogs?: Array<{
    snapshotPath: string
  }>
}

function extractPhotoPath(privateData: unknown): string | undefined {
  if (!privateData || typeof privateData !== "object") return undefined

  const maybePhoto = (privateData as { photoUrl?: unknown }).photoUrl
  return typeof maybePhoto === "string" ? maybePhoto : undefined
}

function extractClaimProfile(privateData: unknown): InventoryRow["claimProfile"] {
  if (!privateData || typeof privateData !== "object") return null

  const claimProfile = (privateData as { claimProfile?: unknown }).claimProfile
  if (!claimProfile || typeof claimProfile !== "object") return null

  const electronicItemType = (claimProfile as { electronicItemType?: unknown }).electronicItemType
  return typeof electronicItemType === "string" ? { electronicItemType } : null
}
