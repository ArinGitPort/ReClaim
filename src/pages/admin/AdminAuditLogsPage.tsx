import { Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { Select } from "@/components/ui/Select"
import { Skeleton } from "@/components/ui/Skeleton"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { actionOptions, AuditLogDetailsModal, useAuditLogs, type AuditAction, type AuditLogRow } from "@/features/admin/audit-logs"
import { toRecordLabel } from "@/features/admin/audit-logs/auditLogUtils"
import { formatDateTime } from "@/lib/formatters"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"

export function AuditLogsPage() {
  const auditLogs = useAuditLogs()

  return (
    <div className="space-y-8">
      <AuditLogDetailsModal log={auditLogs.selectedLog} onClose={() => auditLogs.setSelectedLog(null)} />

      <AdminListHeader
        title="Audit Trail"
        description="Activity feed of verified system actions and administrative updates."
        actions={(
          <AdminExportButton
            title="Audit Trail Export"
            filename="reclaim-audit-trail"
            disabled={!auditLogs.logs.length}
            filters={[
              { label: "Search", value: auditLogs.searchQuery || "All" },
              { label: "Action", value: auditLogs.actionFilter || "All" },
            ]}
            fetchRows={() => fetchAllPages<AuditLogRow>({
              endpoint: "/audit/logs",
              dataKey: "logs",
              params: {
                search: auditLogs.searchQuery.trim() || undefined,
                action: auditLogs.actionFilter || undefined,
              },
              pageSize: 100,
            })}
            getRowDate={(log) => log.createdAt}
            columns={[
              { header: "Date", getValue: (log) => formatExportDate(log.createdAt) },
              { header: "Actor", getValue: (log) => log.actorUser.name },
              { header: "Actor Role", getValue: (log) => log.actorUser.role },
              { header: "Actor Email", getValue: (log) => log.actorUser.email, sensitive: true },
              { header: "Action", getValue: (log) => log.action.replaceAll("_", " ") },
              { header: "Record Type", getValue: (log) => toRecordLabel(log.targetType) },
              { header: "Record", getValue: (log) => log.targetReferenceCode },
              { header: "Details", getValue: (log) => log.actionSentence || log.description },
              { header: "Payload", getValue: (log) => log.payload, sensitive: true },
            ]}
            sensitiveDescription="This audit export can include actor emails and raw payload details. Continue only for authorized internal review."
          />
        )}
      />

      {auditLogs.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {auditLogs.error}
        </div>
      )}

      <div className="space-y-3">
        <AdminListFilters>
          <AdminSearchInput
            value={auditLogs.searchQuery}
            onChange={(value) => {
              auditLogs.setSearchQuery(value)
              auditLogs.setPage(1)
            }}
            placeholder="Search by action, user, record code, or details"
          />
          <div className="w-full md:w-60">
            <Select
              value={auditLogs.actionFilter}
              onChange={(event) => {
                auditLogs.setActionFilter(event.target.value as AuditAction | "")
                auditLogs.setPage(1)
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
            onClick={auditLogs.resetFilters}
            disabled={!auditLogs.searchQuery.length && !auditLogs.actionFilter.length}
          >
            <Filter className="mr-2 h-4 w-4" /> Reset
          </Button>
        </AdminListFilters>

        <p className="text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">{auditLogs.resultLabel}</p>
      </div>

      <AdminTableContainer>
        <AuditLogTable
          logs={auditLogs.logs}
          isLoading={auditLogs.isLoading}
          onSelectLog={auditLogs.setSelectedLog}
        />
      </AdminTableContainer>

      <PaginationControls
        page={auditLogs.page}
        pageCount={auditLogs.pageCount}
        total={auditLogs.total}
        visibleCount={auditLogs.logs.length}
        rowsPerPage={auditLogs.rowsPerPage}
        onPageChange={auditLogs.setPage}
        onRowsPerPageChange={(rows) => {
          auditLogs.setRowsPerPage(rows)
          auditLogs.setPage(1)
        }}
      />
    </div>
  )
}

function AuditLogTable({
  logs,
  isLoading,
  onSelectLog,
}: {
  logs: AuditLogRow[]
  isLoading: boolean
  onSelectLog: (log: AuditLogRow) => void
}) {
  return (
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
            <td className="px-8 py-5 text-xs font-semibold text-slate-600">{formatDateTime(log.createdAt)}</td>
            <td className="px-8 py-5">
              <div className="text-xs font-bold text-slate-800">{log.actorUser.name}</div>
              <div className="text-xs font-semibold text-slate-500">{log.actorUser.role} {"\u2022"} {log.actorUser.email}</div>
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
                onClick={() => onSelectLog(log)}
                className="h-8 bg-brand hover:bg-brand-active text-white px-3 text-[10px] font-extrabold uppercase tracking-widest transition-colors shadow-sm"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" /> View
              </Button>
            </td>
          </tr>
        ))}

        {isLoading && (
          Array.from({ length: 6 }).map((_, index) => (
            <tr key={`audit-skeleton-${index}`}>
              <td colSpan={6} className="px-8 py-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </td>
            </tr>
          ))
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
  )
}
