import { useEffect, useMemo, useState } from "react"
import { Check, Filter, Plus, RefreshCcw, Search, Trash2, TriangleAlert, type LucideIcon } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { AdminSearchFilterBar } from "@/components/admin/AdminSearchFilterBar"
import { BaseModal } from "@/components/ui/BaseModal"
import { DataRow } from "@/components/ui/DataRow"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { api } from "@/lib/api"

type AuditAction =
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

type AuditLogRow = {
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

type ChangeRow = {
  changedField: string
  oldValue: unknown
  newValue: unknown
}

const actionOptions: Array<{ label: string; value: AuditAction | "" }> = [
  { label: "All Actions", value: "" },
  { label: "Item Created", value: "ITEM_CREATED" },
  { label: "Item Updated", value: "ITEM_UPDATED" },
  { label: "Claim Submitted", value: "CLAIM_SUBMITTED" },
  { label: "Claim Reviewed", value: "CLAIM_REVIEWED" },
  { label: "Claim Approved", value: "CLAIM_APPROVED" },
  { label: "Claim Denied", value: "CLAIM_DENIED" },
  { label: "Report Submitted", value: "REPORT_SUBMITTED" },
  { label: "Report Updated", value: "REPORT_UPDATED" },
  { label: "Report Linked", value: "REPORT_LINKED" },
  { label: "Handover Completed", value: "HANDOVER_COMPLETED" },
  { label: "Auth Login", value: "AUTH_LOGIN" },
]

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("")
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs({
        search: searchQuery.trim() || undefined,
        action: actionFilter || undefined,
        page,
        limit: rowsPerPage,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery, actionFilter, page, rowsPerPage])

  async function loadLogs(filters: { search?: string; action?: AuditAction; page: number; limit: number }): Promise<void> {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<{
        logs: AuditLogRow[]
        pagination: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/audit/logs", {
        params: {
          search: filters.search,
          action: filters.action,
          page: filters.page,
          limit: filters.limit,
        },
      })

      setLogs(response.data.logs || [])
      setTotal(response.data.pagination?.total || 0)
      setPageCount(response.data.pagination?.pageCount || 1)
    } catch {
      setError("Unable to load audit records.")
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const resultLabel = useMemo(() => {
    return `Showing ${logs?.length || 0} of ${total} log${total === 1 ? "" : "s"}`
  }, [logs?.length, total])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {selectedLog && (
        <AuditDetailModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}

      <AdminPageHeader 
        title="Audit Archive" 
        subtitle="Activity feed of verified system actions and administrative updates." 
      />

      {error && (
        <div style={{ borderRadius: '0.75rem', border: '1px solid #FECACA', backgroundColor: '#FEF2F2', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#B91C1C' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <AdminSearchFilterBar>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', height: '1rem', width: '1rem', color: '#94A3B8' }} />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search by action, user, record code, or details"
              style={{ height: '3rem', width: '100%', borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', paddingLeft: '3rem', fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ width: '15rem' }}>
            <Select
              value={actionFilter}
              onChange={(event) => {
                setActionFilter(event.target.value as AuditAction | "")
                setPage(1)
              }}
              style={{ height: '3rem', width: '100%', borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            >
              {actionOptions.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            style={{ height: '3rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '0 1.5rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => {
              setSearchQuery("")
              setActionFilter("")
              setPage(1)
            }}
            disabled={!searchQuery.length && !actionFilter.length}
          >
            <Filter style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} /> Reset
          </Button>
        </AdminSearchFilterBar>

        <p style={{ textAlign: 'right', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', margin: 0 }}>{resultLabel}</p>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        {logs.length > 0 && !isLoading && <div style={{ position: 'absolute', bottom: '2rem', left: '3rem', top: '2rem', width: '1px', backgroundColor: '#E2E8F0' }} />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          {logs.map((log) => {
            const visual = getTimelineVisual(log.action)

            return (
              <ActivityLogCard 
                key={log.id} 
                log={log} 
                visual={visual}
                onViewChanges={() => setSelectedLog(log)} 
              />
            )
          })}

          {isLoading && (
            <div style={{ padding: '3rem 0', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
              Loading activity timeline...
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <div style={{ padding: '3rem 0', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
              No activity found for current filters.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onChange={(event) => {
              setRowsPerPage(Number(event.target.value))
              setPage(1)
            }}
            style={{ height: '2.25rem', width: '6rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 700 }}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </Select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            type="button"
            variant="outline"
            style={{ height: '2.25rem', border: '1px solid #E2E8F0', padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', backgroundColor: '#FFFFFF', borderRadius: '0.375rem' }}
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Page {page} of {pageCount}</span>
          <Button
            type="button"
            variant="outline"
            style={{ height: '2.25rem', border: '1px solid #E2E8F0', padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', backgroundColor: '#FFFFFF', borderRadius: '0.375rem' }}
            disabled={page >= pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function ActivityLogCard({
  log,
  visual,
  onViewChanges
}: {
  log: AuditLogRow
  visual: { icon: LucideIcon; nodeStyle: React.CSSProperties }
  onViewChanges: () => void
}) {
  const Icon = visual.icon
  return (
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '3rem minmax(0, 1fr)', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.25rem' }}>
        <div style={visual.nodeStyle}>
          <Icon style={{ height: '1rem', width: '1rem' }} />
        </div>
      </div>

      <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', margin: 0 }}>{formatTimelineDate(log.createdAt)}</p>
          <span style={{ borderRadius: '0.375rem', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0.25rem 0.5rem', fontSize: '10px', fontWeight: 600, color: '#64748B' }}>
            Log ID: {log.id.slice(0, 8)}
          </span>
        </div>

        <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.5rem', color: '#1E293B', margin: 0 }}>
          {renderNarrativeSentence(log)}
        </p>

        {log.description && <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748B', margin: '0.25rem 0 0 0' }}>{log.description}</p>}

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
            {log.actorUser.role} · {log.actorUser.email}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onViewChanges}
            style={{ height: '2rem', border: '1px solid #E2E8F0', padding: '0 0.75rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', backgroundColor: '#FFFFFF', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            View Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

function AuditDetailModal({ log, onClose }: { log: AuditLogRow; onClose: () => void }) {
  return (
    <BaseModal 
      onClose={onClose} 
      title="Activity Details" 
      id={log.id}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <DataRow label="Log ID" value={log.id} mono />
            <DataRow label="Date & Time" value={new Date(log.createdAt).toLocaleString()} />
            <DataRow label="User" value={log.actorUser.name} />
            <DataRow label="Role" value={log.actorUser.role} />
            <DataRow label="Email" value={log.actorUser.email} />
            <DataRow label="Record" value={`${toRecordLabel(log.targetType)} (${log.targetReferenceCode})`} />
          </div>

          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '1rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Action</div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: '0.5rem 0 0 0' }}>{renderNarrativeSentence(log)}</p>
            {log.description && (
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748B', margin: '0.25rem 0 0 0' }}>{log.description}</p>
            )}
          </div>

          <PayloadPanel payload={log.payload} />
        </div>
    </BaseModal>
  )
}


function PayloadPanel({ payload }: { payload: unknown }) {
  const payloadObject = toObject(payload)
  const changes = Array.isArray(payloadObject?.changes) ? (payloadObject?.changes as ChangeRow[]) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1rem' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Before &amp; After Payload</div>

      {changes.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>
                <th style={{ padding: '0.5rem 0.75rem 0.5rem 0' }}>Field</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Before</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>After</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {changes.map((change, index) => (
                <tr key={`${change.changedField}-${index}`} style={{ borderBottom: index === changes.length - 1 ? 'none' : '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.5rem 0.75rem 0.5rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{change.changedField}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{stringifyValue(change.oldValue)}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{stringifyValue(change.newValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', margin: 0 }}>No field delta metadata is available for this log entry.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div style={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '0.75rem' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Before</div>
          <pre style={{ marginTop: '0.5rem', maxHeight: '13rem', overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.75rem', fontWeight: 600, color: '#475569', margin: '0.5rem 0 0 0' }}>
            {JSON.stringify(payloadObject?.before ?? {}, null, 2)}
          </pre>
        </div>
        <div style={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '0.75rem' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>After</div>
          <pre style={{ marginTop: '0.5rem', maxHeight: '13rem', overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.75rem', fontWeight: 700, color: '#334155', margin: '0.5rem 0 0 0' }}>
            {JSON.stringify(payloadObject?.after ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

function toRecordLabel(targetType: string): string {
  if (targetType === "found_item") return "Found Item"
  if (targetType === "claim") return "Claim"
  if (targetType === "lost_report") return "Lost Report"
  if (targetType === "handover") return "Handover"
  if (targetType === "user") return "User"
  return targetType
}

function toObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }

  return value as Record<string, unknown>
}

function stringifyValue(value: unknown): string {
  if (value === null) return "null"
  if (typeof value === "undefined") return "undefined"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return JSON.stringify(value)
}

function formatTimelineDate(value: string): string {
  const date = new Date(value)
  const datePart = date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })

  return `${datePart} - ${timePart}`
}

function renderNarrativeSentence(log: AuditLogRow) {
  const recordLabel = toRecordLabel(log.targetType)
  const reference = `(${log.targetReferenceCode})`

  if (log.action === "REPORT_LINKED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        linked {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span> to a Found Item.
      </>
    )
  }

  if (log.action === "REPORT_UPDATED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        updated the status of {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "ITEM_UPDATED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        updated details for {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "ITEM_CREATED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        logged {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_DENIED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        denied {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_APPROVED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        approved {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_SUBMITTED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        submitted {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_REVIEWED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        reviewed {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "HANDOVER_COMPLETED") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        completed handover for {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
      </>
    )
  }

  if (log.action === "AUTH_LOGIN") {
    return (
      <>
        <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>{" "}
        logged in to the system.
      </>
    )
  }

  return (
    <>
      <span style={{ fontWeight: 800, color: '#0F172A' }}>{log.actorUser.name}</span>
      {" "}
      updated {recordLabel} <span style={{ fontWeight: 800, color: '#0F172A' }}>{reference}</span>.
    </>
  )
}

function getTimelineVisual(action: AuditAction): { icon: LucideIcon; nodeStyle: React.CSSProperties } {
  if (action === "ITEM_CREATED" || action === "REPORT_SUBMITTED" || action === "CLAIM_SUBMITTED") {
    return {
      icon: Plus,
      nodeStyle: {
        display: 'flex',
        height: '2.25rem',
        width: '2.25rem',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        border: '1px solid',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        borderColor: '#BFDBFE',
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
      },
    }
  }

  if (action === "HANDOVER_COMPLETED" || action === "REPORT_LINKED" || action === "CLAIM_APPROVED") {
    return {
      icon: Check,
      nodeStyle: {
        display: 'flex',
        height: '2.25rem',
        width: '2.25rem',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        border: '1px solid',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        borderColor: '#A7F3D0',
        backgroundColor: '#ECFDF5',
        color: '#059669',
      },
    }
  }

  if (action === "CLAIM_DENIED") {
    return {
      icon: TriangleAlert,
      nodeStyle: {
        display: 'flex',
        height: '2.25rem',
        width: '2.25rem',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        border: '1px solid',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
      },
    }
  }

  if (action.includes("DELETE")) {
    return {
      icon: Trash2,
      nodeStyle: {
        display: 'flex',
        height: '2.25rem',
        width: '2.25rem',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        border: '1px solid',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
      },
    }
  }

  return {
    icon: RefreshCcw,
    nodeStyle: {
      display: 'flex',
      height: '2.25rem',
      width: '2.25rem',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '9999px',
      border: '1px solid',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      borderColor: '#FDE68A',
      backgroundColor: '#FFFBEB',
      color: '#D97706',
    },
  }
}
