export type AuditAction =
  | "ITEM_CREATED"
  | "ITEM_UPDATED"
  | "CLAIM_SUBMITTED"
  | "CLAIM_REVIEWED"
  | "CLAIM_APPROVED"
  | "CLAIM_DENIED"
  | "REPORT_SUBMITTED"
  | "REPORT_UPDATED"
  | "REPORT_LINKED"
  | "HANDOVER_COMPLETED"
  | "AUTH_LOGIN"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_ROLE_CHANGED"
  | "USER_DISABLED"
  | "USER_ENABLED"
  | "USER_PASSWORD_RESET"
  | "SYSTEM_SETTINGS_UPDATED"
  | "SNAPSHOT_DISMISSED"
  | "SNAPSHOT_RESTORED"

export type AuditLogRow = {
  id: string
  action: AuditAction
  targetType: string
  targetId: string
  targetReferenceCode: string
  actionSentence: string
  description?: string | null
  payload?: unknown
  createdAt: string
  actorUser: {
    id: string
    name: string
    email: string
    role: "STUDENT" | "STAFF" | "ADMIN"
    studentId?: string | null
  }
}

export type ChangeRow = {
  changedField: string
  oldValue: unknown
  newValue: unknown
}
