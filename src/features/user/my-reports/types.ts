export type ReportRealtimeEvent = {
  reportId: string
  reportCode: string
  status: string
  reporterUserId: string
  matchedItemId?: string | null
}

export interface ReportView {
  ticketId: string
  id: string
  item: string
  category: string
  color: string
  dateFiled: string
  dateLost: string
  location: string
  timeWindow: string
  brand: string
  marks: string
  privateNote: string
  rawStatus: string
  status: string
  pickupToken: string | null
  pickupTokenExpires: string | null
}
