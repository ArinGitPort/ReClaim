export type InventoryRow = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundAtUtc: string
  foundLocation: string
  date: string
  location: string
  status: string
  storage: string
  isHandoverReady: boolean
  handoverClaim?: {
    id: string
    claimCode: string
    pickupTokenExpires?: string | null
    claimantUserId: string
  } | null
  privateDiscoveryNote?: string
  photoUrl?: string
  claimProfile?: {
    electronicItemType?: string | null
  } | null
}
