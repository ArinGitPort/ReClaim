export type ClaimStatus = "PENDING_VERIFICATION" | "INQUIRY_REQUIRED" | "APPROVED" | "DENIED" | "CANCELLED" | "EXPIRED"
export type ClaimDecision = "APPROVED" | "DENIED"

export type ClaimRow = {
  id: string
  claimCode: string
  status: ClaimStatus
  createdAt: string
  reviewerNote?: string | null
  submittedProof: Record<string, unknown>
  claimantUser: {
    name: string
    studentId?: string | null
    email: string
  }
  foundItem: {
    id: string
    code: string
    title: string
    category: string
    color: string
    foundLocation: string
  }
}
