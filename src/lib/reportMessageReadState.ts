const STORAGE_KEY = "reclaim.reportMessageLastViewed"

type LastViewedByReport = Record<string, string>

export type ReportMessageMeta = {
  sender?: "STUDENT" | "STAFF" | "ADMIN"
  createdAt?: string | null
} | null | undefined

export function markReportMessagesViewed(reportId: string, viewedAt = new Date().toISOString()): void {
  const state = readState()
  state[reportId] = viewedAt
  writeState(state)
}

export function hasUnreadReportMessage(
  reportId: string,
  latestMessage: ReportMessageMeta,
  viewerRole: "STUDENT" | "ADMIN",
): boolean {
  if (!latestMessage?.createdAt || !latestMessage.sender) return false

  const senderIsAdmin = latestMessage.sender === "ADMIN" || latestMessage.sender === "STAFF"
  if ((viewerRole === "STUDENT" && !senderIsAdmin) || (viewerRole === "ADMIN" && senderIsAdmin)) {
    return false
  }

  const lastViewed = readState()[reportId]
  if (!lastViewed) return true

  return new Date(latestMessage.createdAt).getTime() > new Date(lastViewed).getTime()
}

function readState(): LastViewedByReport {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeState(state: LastViewedByReport): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Local unread indicators are best-effort.
  }
}
