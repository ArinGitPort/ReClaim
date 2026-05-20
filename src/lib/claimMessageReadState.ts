const STORAGE_KEY = "reclaim.claimMessageLastViewed"

type LastViewedByClaim = Record<string, string>

export type ClaimMessageMeta = {
  sender?: "STUDENT" | "STAFF" | "ADMIN"
  createdAt?: string | null
} | null | undefined

export function getClaimMessageLastViewed(claimId: string): string | null {
  return readState()[claimId] ?? null
}

export function markClaimMessagesViewed(claimId: string, viewedAt = new Date().toISOString()): void {
  const state = readState()
  state[claimId] = viewedAt
  writeState(state)
}

export function hasUnreadClaimMessage(
  claimId: string,
  latestMessage: ClaimMessageMeta,
  viewerRole: "STUDENT" | "ADMIN",
): boolean {
  if (!latestMessage?.createdAt || !latestMessage.sender) return false

  const senderIsAdmin = latestMessage.sender === "ADMIN" || latestMessage.sender === "STAFF"
  if ((viewerRole === "STUDENT" && !senderIsAdmin) || (viewerRole === "ADMIN" && senderIsAdmin)) {
    return false
  }

  const lastViewed = getClaimMessageLastViewed(claimId)
  if (!lastViewed) return true

  return new Date(latestMessage.createdAt).getTime() > new Date(lastViewed).getTime()
}

function readState(): LastViewedByClaim {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeState(state: LastViewedByClaim): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Local unread indicators are best-effort.
  }
}
