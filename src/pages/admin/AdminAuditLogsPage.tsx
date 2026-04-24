import { useEffect, useMemo, useState } from "react"
import { Filter, Eye, X, Activity, Database } from "lucide-react"
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
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto px-4 py-10 md:py-16">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-h-[90vh] flex flex-col max-w-3xl overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-brand uppercase tracking-tight">Activity Details</h2>
                  <p className="font-mono mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{selectedLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                   <Activity className="w-3.5 h-3.5 text-brand" />
                   <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Context & Actor</h4>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 rounded-xl bg-slate-50/50 p-5 border border-slate-100">
                  <InfoRow label="Date & Time" value={new Date(selectedLog.createdAt).toLocaleString()} />
                  <InfoRow label="User" value={selectedLog.actorUser.name} />
                  <InfoRow label="Role" value={selectedLog.actorUser.role} />
                  <InfoRow label="Email" value={selectedLog.actorUser.email} />
                  <InfoRow label="Record Target" value={`${toRecordLabel(selectedLog.targetType)} (${selectedLog.targetReferenceCode})`} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                   <Filter className="w-3.5 h-3.5 text-brand" />
                   <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Audited Action</h4>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand" />
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed ml-2">{renderNarrativeSentence(selectedLog)}</p>
                  {selectedLog.description && (
                    <p className="mt-3 ml-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">{selectedLog.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                   <Database className="w-3.5 h-3.5 text-brand" />
                   <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Payload Data</h4>
                </div>
                <PayloadPanel payload={selectedLog.payload} />
              </div>
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
                  <div className="text-xs font-semibold text-slate-500">{log.actorUser.role} • {log.actorUser.email}</div>
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
                    onClick={() => setSelectedLog(log)}
                    className="h-8 bg-brand hover:bg-brand-active text-white px-3 text-[10px] font-extrabold uppercase tracking-widest transition-colors shadow-sm"
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
  
  if (!payloadObject) {
    return (
      <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">No payload data recorded for this action.</p>
      </div>
    )
  }

  const changes = Array.isArray(payloadObject.changes) ? (payloadObject.changes as ChangeRow[]) : []

  if (changes.length > 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm bg-white">
        <table className="w-full min-w-max border-collapse text-left bg-white">
          <thead className="bg-slate-50/80 border-b border-slate-200/60">
            <tr className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3 border-r border-slate-200/60">Field Adjusted</th>
              <th className="px-4 py-3">Previous Value (Before)</th>
              <th className="px-4 py-3 border-l border-slate-200/60 bg-emerald-50/20">New Value (After)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {changes.map((change, index) => (
              <tr key={`${change.changedField}-${index}`} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-slate-700 bg-slate-50/30 border-r border-slate-100 group-hover:border-slate-200/60 align-top">
                  {change.changedField}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-rose-600/90 break-all bg-rose-50/10 align-top max-w-[200px]">
                  {stringifyValue(change.oldValue)}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-emerald-700 border-l border-slate-100 group-hover:border-slate-200/60 bg-emerald-50/20 break-all align-top max-w-[200px]">
                  {stringifyValue(change.newValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const payloadAfter = (payloadObject.after as Record<string, unknown>) || payloadObject
  const keys = Object.keys(payloadAfter).filter(k => k !== 'changes')

  if (keys.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">No detailed payload changes recorded.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/80 border-b border-slate-200/60">
          <tr className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            <th className="px-4 py-3 border-r border-slate-200/60 w-1/3">Payload Property</th>
            <th className="px-4 py-3 w-2/3">Recorded Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {keys.map((key) => (
            <tr key={key} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 text-xs font-bold text-slate-700 bg-slate-50/30 border-r border-slate-100 align-top break-all">
                {key}
              </td>
              <td className="px-4 py-3 text-xs font-semibold text-slate-600 align-top break-all max-w-[300px]">
                {stringifyValue(payloadAfter[key])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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


