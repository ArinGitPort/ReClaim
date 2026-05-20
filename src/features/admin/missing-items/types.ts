export type ReportStatus = "SUBMITTED" | "UNDER_REVIEW" | "ACTIVE_SEARCH" | "MATCHED" | "RESOLVED" | "REJECTED"

export type ReportRow = {
  id: string
  code: string
  student: string
  studentId: string
  item: string
  category: string
  color: string
  brand: string
  date: string
  location: string
  timeWindow: string
  status: ReportStatus
  privateNote: string
  attachmentUrls: string[]
  latestMessage: {
    sender: "STUDENT" | "STAFF" | "ADMIN"
    createdAt: string
  } | null
  deviceName?: string
  nameOnDoc?: string
  marks: string
  reportedLostAtUtcRaw: string
  linkedItem?: {
    id: string
    code: string
    title: string
    category: string
    color: string
    storageLocation: string
    status: string
  }
}
