import type { ClaimView } from "./types"

export function formatClaimStatus(rawStatus: string, itemStatus?: string): string {
  if (rawStatus === "APPROVED" && itemStatus === "RETURNED") return "Completed"

  const map: Record<string, string> = {
    PENDING_VERIFICATION: "Pending Verification",
    INQUIRY_REQUIRED: "Inquiry Required",
    APPROVED: "Approved",
    DENIED: "Denied",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  }
  return map[rawStatus] ?? rawStatus.replaceAll("_", " ")
}

export function claimStatusMessage(claim: ClaimView, now: number): string {
  if (claim.rawStatus === "PENDING_VERIFICATION" && claim.reservationExpiresAt) {
    return `Reserved for ${formatTimeRemaining(claim.reservationExpiresAt, now)}`
  }

  if (claim.rawStatus === "INQUIRY_REQUIRED" && claim.reservationExpiresAt) {
    return `Action needed - hold expires in ${formatTimeRemaining(claim.reservationExpiresAt, now)}`
  }

  if (claim.status === "Inquiry Required") return "Admin requires additional proof details"
  if (claim.status === "Denied") return "Claim denied by admin review"
  if (claim.status === "Approved") return "Claim approved - present your token at the Admin Office"
  if (claim.status === "Expired") return "Reservation expired before review"
  if (claim.status === "Cancelled") return "Closed by you; retry cooldown may apply"
  return "Awaiting admin review"
}

export function formatTimeRemaining(expiresAt: string, now: number): string {
  const diffMs = new Date(expiresAt).getTime() - now
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "0m"

  const totalMinutes = Math.ceil(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

export function isClosableClaimStatus(status: string): boolean {
  return status === "PENDING_VERIFICATION" || status === "INQUIRY_REQUIRED"
}
