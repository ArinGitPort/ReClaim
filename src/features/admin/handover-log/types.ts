export type HandoverLogRow = {
  id: string
  pickupTokenPresented: string
  releasedAtUtc: string
  note?: string | null
  claim?: {
    claimCode: string
  } | null
  foundItem: {
    code: string
    title: string
    category: string
    storageLocation?: string | null
    status: string
  }
  releasedToUser: {
    name: string
    studentId?: string | null
    email: string
  }
}
