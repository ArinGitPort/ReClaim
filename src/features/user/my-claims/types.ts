export interface ClaimView {
  ticketId: string
  id: string
  itemId: string
  item: string
  imageUrl?: string | null
  category: string
  location: string
  submittedDate: string
  rawStatus: string
  status: string
  reviewerNote?: string | null
  reservationExpiresAt: string | null
  pickupToken: string | null
  pickupTokenExpires: string | null
  itemStatus: string
}
