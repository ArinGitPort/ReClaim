export function toStudentStatusLabel(status: string): string {
  if (status === "SUBMITTED") return "Submitted"
  if (status === "UNDER_REVIEW") return "Under Review"
  if (status === "ACTIVE_SEARCH") return "Active Search"
  if (status === "RESOLVED") return "Closed"
  if (status === "MATCHED") return "Match Found"
  if (status === "REJECTED") return "Rejected"
  return status.replaceAll("_", " ")
}

export function reportStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    Submitted: "Your report was received and is queued for admin review",
    "Under Review": "Admin is reviewing your report",
    "Active Search": "Administration has authorized this report and is actively searching",
    "Match Found": "A matching item has been found - check Token Wallet for pickup details",
    Closed: "Report workflow is complete",
    Rejected: "Report was reviewed and not authorized",
  }

  return messages[status] ?? "Status updated"
}

export function isClosableReportStatus(status: string): boolean {
  return status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "ACTIVE_SEARCH"
}
