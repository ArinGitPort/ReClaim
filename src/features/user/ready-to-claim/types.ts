export type PickupRow = {
  source: "CLAIM" | "REPORT_MATCH"
  sourceCode: string
  itemId: string
  itemTitle: string
  pickupToken: string
  pickupTokenExpires?: string | null
  officeLocation: string
  createdAt: string
}
