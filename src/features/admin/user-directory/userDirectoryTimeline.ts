import type { UserDirectoryDetails } from "@/features/admin/types"

export type TimelineEntry = {
  id: string
  type: "claim" | "report" | "handover" | "audit"
  title: string
  subtitle: string
  status: string
  createdAt: string
}

export function buildTimelineEntries(details: UserDirectoryDetails | null): TimelineEntry[] {
  if (!details) return []

  const entries: TimelineEntry[] = [
    ...details.claims.map((claim) => ({
      id: claim.id,
      type: "claim" as const,
      title: `${claim.claimCode} / ${claim.foundItem.title}`,
      subtitle: `Claim for ${claim.foundItem.code} in ${claim.foundItem.foundLocation}`,
      status: claim.status,
      createdAt: claim.createdAt,
    })),
    ...details.reports.map((report) => ({
      id: report.id,
      type: "report" as const,
      title: `${report.reportCode} / ${report.title}`,
      subtitle: `Lost report from ${report.location}`,
      status: report.status,
      createdAt: report.createdAt,
    })),
    ...details.handovers.map((handover) => ({
      id: handover.id,
      type: "handover" as const,
      title: `Returned ${handover.foundItem.code}`,
      subtitle: `${handover.foundItem.title} released with pickup token ${handover.pickupTokenPresented}`,
      status: "RETURNED",
      createdAt: handover.releasedAtUtc,
    })),
    ...details.auditLogs.map((log) => ({
      id: log.id,
      type: "audit" as const,
      title: log.action.replaceAll("_", " "),
      subtitle: log.description ?? `${log.actorUser.name} performed this action`,
      status: log.actorUser.role,
      createdAt: log.createdAt,
    })),
  ]

  return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
