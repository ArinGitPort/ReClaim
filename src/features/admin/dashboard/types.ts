export type DashboardData = {
  metrics: {
    activeInventory: number
    pendingClaims: number
    activeSearches: number
    activeCameras: number
  }
  inventoryBreakdown: {
    available: number
    claimPending: number
    returned: number
    archived: number
  }
  lostReportBreakdown: {
    submitted: number
    underReview: number
    activeSearch: number
    matched: number
    resolved: number
    rejected: number
  }
  inquiryClaims: Array<{
    id: string
    claimCode: string
    foundItem: { code: string; title: string }
    claimantUser: { name: string; email: string }
    updatedAt: string
  }>
  recentMatches: Array<{
    id: string
    reportCode: string
    title: string
    matchedItemId: string
    matchedItem?: { code: string }
    reporterUser: { name: string; email: string }
    updatedAt: string
  }>
  recentActivity: Array<{
    id: string
    action: string
    createdAt: string
    actorUser: { name: string; role: string }
  }>
}

export type OperationsQueueKey =
  | "pendingClaims"
  | "inquiryClaims"
  | "approvedPickups"
  | "activeReports"
  | "pendingSnapshots"
  | "expiredInventory"

export type OperationsQueueItem = {
  id: string
  code: string
  title: string
  subjectCode?: string | null
  status: string
  ownerName: string
  route: string
  dueAt?: string | null
  urgency: "high" | "normal"
  nextAction: string
}

export type OperationsData = {
  counts: {
    pendingClaims: number
    inquiryClaims: number
    approvedPickups: number
    activeReports: number
    pendingSnapshots: number
    expiredInventory: number
    nearRetentionInventory: number
  }
  retentionPolicy: {
    foundItemRetentionDays: number
  }
  queues: Record<OperationsQueueKey, OperationsQueueItem[]>
}
