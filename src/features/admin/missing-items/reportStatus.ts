import type { ReportStatus } from "./types"

export function reportNextAction(status: ReportStatus): string {
  if (status === "SUBMITTED" || status === "UNDER_REVIEW") return "Needs Review"
  if (status === "ACTIVE_SEARCH") return "Search Active"
  if (status === "MATCHED") return "Matched"
  if (status === "RESOLVED") return "Resolved"
  return "Rejected"
}

export function isReviewableReport(status: ReportStatus): boolean {
  return status === "SUBMITTED" || status === "UNDER_REVIEW"
}

export function isAuthorizedReport(status: ReportStatus): boolean {
  return status === "ACTIVE_SEARCH"
}
