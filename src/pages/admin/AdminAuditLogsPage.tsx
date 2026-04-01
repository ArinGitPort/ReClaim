import { useEffect, useMemo, useState } from "react"
import { Filter, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
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

      setLogs(response.data.logs)
      setTotal(response.data.pagination.total)
      setPageCount(response.data.pagination.pageCount)
    } catch {
      setError("Unable to load audit records.")
    } finally {
      setIsLoading(false)
    }
  }

  const resultLabel = useMemo(() => {
    return `Showing ${logs.length} of ${total} log${total === 1 ? "" : "s"}`
  }, [logs.length, total])

  return (
    <div className="space-y-8">
      {selectedLog && (
        <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto px-4 py-10">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900">Activity Details</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{selectedLog.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoRow label="Log ID" value={selectedLog.id} mono />
                <InfoRow label="Date & Time" value={new Date(selectedLog.createdAt).toLocaleString()} />
                <InfoRow label="User" value={selectedLog.actorUser.name} />
                <InfoRow label="Role" value={selectedLog.actorUser.role} />
                <InfoRow label="Email" value={selectedLog.actorUser.email} />
                <InfoRow label="Record" value={`${toRecordLabel(selectedLog.targetType)} (${selectedLog.targetReferenceCode})`} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</div>
                <p className="mt-2 text-sm font-semibold text-slate-700">{renderNarrativeSentence(selectedLog)}</p>
                {selectedLog.description && (
                  <p className="mt-1 text-xs font-medium text-slate-500">{selectedLog.description}</p>
                )}
              </div>

              <PayloadPanel payload={selectedLog.payload} />
            </div>
          </div>
        </div>
      )}

      <AdminListHeader
        title="Records & Accountability"
        description="Activity feed of verified system actions and administrative updates."
        actions={<AdminExportButton disabled={!logs.length} />}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <AdminListFilters>
          <AdminSearchInput
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value)
              setPage(1)
            }}
            placeholder="Search by action, user, record code, or details"
          />
          <div className="w-full md:w-60">
            <Select
              value={actionFilter}
              onChange={(event) => {
                setActionFilter(event.target.value as AuditAction | "")
                setPage(1)
              }}
              className="h-12 rounded-xl border-slate-200 bg-white text-sm font-semibold shadow-sm"
            >
              {actionOptions.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600"
            onClick={() => {
              setSearchQuery("")
              setActionFilter("")
              setPage(1)
            }}
            disabled={!searchQuery.length && !actionFilter.length}
          >
            <Filter className="mr-2 h-4 w-4" /> Reset
          </Button>
        </AdminListFilters>

        <p className="text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">{resultLabel}</p>
      </div>

      <AdminTableContainer>
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
              <th className="px-8 py-5">Date & Time</th>
              <th className="px-8 py-5">Actor</th>
              <th className="px-8 py-5">Action</th>
              <th className="px-8 py-5">Record</th>
              <th className="px-8 py-5">Details</th>
              <th className="px-8 py-5 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                <td className="px-8 py-5 text-xs font-semibold text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-8 py-5">
                  <div className="text-xs font-bold text-slate-800">{log.actorUser.name}</div>
                  <div className="text-xs font-semibold text-slate-500">{log.actorUser.role} â€¢ {log.actorUser.email}</div>
                </td>
                <td className="px-8 py-5 text-xs font-bold text-slate-700">{log.action.replaceAll("_", " ")}</td>
                <td className="px-8 py-5">
                  <div className="text-xs font-bold text-slate-800">{toRecordLabel(log.targetType)}</div>
                  <div className="text-xs font-semibold text-slate-500">{log.targetReferenceCode}</div>
                </td>
                <td className="px-8 py-5 text-xs font-semibold text-slate-600 max-w-[320px] truncate">{log.actionSentence || log.description || "-"}</td>
                <td className="px-8 py-5 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedLog(log)}
                    className="h-8 border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                  </Button>
                </td>
              </tr>
            ))}

            {isLoading && (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-sm font-semibold text-slate-500">
                  Loading activity records...
                </td>
              </tr>
            )}

            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-sm font-semibold text-slate-500">
                  No activity found for current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableContainer>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onChange={(event) => {
              setRowsPerPage(Number(event.target.value))
              setPage(1)
            }}
            className="h-9 w-24 border-slate-200 bg-white text-xs font-bold"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-slate-200 px-3 text-xs font-bold uppercase tracking-widest"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Page {page} of {pageCount}</span>
          <Button
            type="button"
            variant="outline"
            className="h-9 border-slate-200 px-3 text-xs font-bold uppercase tracking-widest"
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

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={mono ? "mt-1 text-sm font-bold text-slate-700 font-mono" : "mt-1 text-sm font-semibold text-slate-700"}>{value}</div>
    </div>
  )
}

function PayloadPanel({ payload }: { payload: unknown }) {
  const payloadObject = toObject(payload)
  const changes = Array.isArray(payloadObject?.changes) ? (payloadObject?.changes as ChangeRow[]) : []

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Before &amp; After Payload</div>

      {changes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="py-2 pr-3">Field</th>
                <th className="px-3 py-2">Before</th>
                <th className="px-3 py-2">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {changes.map((change, index) => (
                <tr key={`${change.changedField}-${index}`}>
                  <td className="py-2 pr-3 text-xs font-bold text-slate-700">{change.changedField}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-slate-600">{stringifyValue(change.oldValue)}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-slate-700">{stringifyValue(change.newValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs font-semibold text-slate-500">No field delta metadata is available for this log entry.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Before</div>
          <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap text-xs font-semibold text-slate-600">
            {JSON.stringify(payloadObject?.before ?? {}, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">After</div>
          <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap text-xs font-semibold text-slate-700">
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

function renderNarrativeSentence(log: AuditLogRow) {
  const recordLabel = toRecordLabel(log.targetType)
  const reference = `(${log.targetReferenceCode})`

  if (log.action === "REPORT_LINKED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        linked {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span> to a Found Item.
      </>
    )
  }

  if (log.action === "REPORT_UPDATED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        updated the status of {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "ITEM_UPDATED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        updated details for {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "ITEM_CREATED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        logged {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_DENIED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        denied {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_APPROVED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        approved {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_SUBMITTED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        submitted {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "CLAIM_REVIEWED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        reviewed {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "HANDOVER_COMPLETED") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        completed handover for {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
      </>
    )
  }

  if (log.action === "AUTH_LOGIN") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>{" "}
        logged in to the system.
      </>
    )
  }

  return (
    <>
      <span className="font-extrabold text-slate-900">{log.actorUser.name}</span>
      {" "}
      updated {recordLabel} <span className="font-extrabold text-slate-900">{reference}</span>.
    </>
  )
}


