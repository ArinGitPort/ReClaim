import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import {
  HandoverLogDetailsModal,
  HandoverLogFilters,
  HandoverLogTable,
  useHandoverLog,
} from "@/features/admin/handover-log"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"
import type { HandoverLogRow } from "@/features/admin/handover-log"

export function HandoverLogPage() {
  const handoverLog = useHandoverLog()

  return (
    <div className="space-y-8">
      <HandoverLogDetailsModal
        log={handoverLog.selectedLog}
        isRestoring={handoverLog.isRestoring}
        onClose={() => handoverLog.setSelectedLog(null)}
        onRestoreClick={(id) => {
          handoverLog.setRestoreLogId(id)
          handoverLog.setShowRestoreConfirm(true)
        }}
      />

      <AdminListHeader
        title="Handover Log"
        description="Permanent record of successful returns and student handovers."
        actions={(
          <AdminExportButton
            title="Handover Log Export"
            filename="reclaim-handover-log"
            disabled={!handoverLog.logs.length}
            filters={[
              { label: "Search", value: handoverLog.logsSearch || "All" },
              { label: "Source", value: handoverLog.sourceFilter || "All" },
            ]}
            fetchRows={() => fetchAllPages<HandoverLogRow>({
              endpoint: "/handover/logs",
              dataKey: "handovers",
              params: {
                search: handoverLog.logsSearch.trim() || undefined,
                source: handoverLog.sourceFilter || undefined,
              },
            })}
            getRowDate={(log) => log.releasedAtUtc}
            columns={[
              { header: "Released At", getValue: (log) => formatExportDate(log.releasedAtUtc) },
              { header: "Item Code", getValue: (log) => log.foundItem.code },
              { header: "Item Title", getValue: (log) => log.foundItem.title },
              { header: "Category", getValue: (log) => log.foundItem.category },
              { header: "Claim", getValue: (log) => log.claim?.claimCode },
              { header: "Released To", getValue: (log) => log.releasedToUser.name },
              { header: "Student ID", getValue: (log) => log.releasedToUser.studentId, sensitive: true },
              { header: "Email", getValue: (log) => log.releasedToUser.email, sensitive: true },
              { header: "Pickup Token", getValue: (log) => log.pickupTokenPresented, sensitive: true },
              { header: "Note", getValue: (log) => log.note, sensitive: true },
            ]}
            sensitiveDescription="This handover export can include student identifiers, pickup tokens, and staff notes. Continue only if the file will be stored securely."
          />
        )}
      />

      <div className="space-y-3">
        <HandoverLogFilters
          search={handoverLog.logsSearch}
          sourceFilter={handoverLog.sourceFilter}
          sourceOptions={handoverLog.sourceOptions}
          onSearchChange={handoverLog.setLogsSearch}
          onSourceChange={handoverLog.setSourceFilter}
          onReset={handoverLog.resetFilters}
        />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">{handoverLog.resultLabel}</p>
      </div>

      <HandoverLogTable
        logs={handoverLog.logs}
        isLoading={handoverLog.isLoadingLogs}
        onSelectLog={handoverLog.setSelectedLog}
      />

      <PaginationControls
        page={handoverLog.page}
        pageCount={handoverLog.pageCount}
        total={handoverLog.total}
        visibleCount={handoverLog.logs.length}
        rowsPerPage={handoverLog.rowsPerPage}
        onPageChange={handoverLog.setPage}
        onRowsPerPageChange={(nextRows) => {
          handoverLog.setRowsPerPage(nextRows)
          handoverLog.setPage(1)
        }}
      />

      <ConfirmModal
        isOpen={handoverLog.showRestoreConfirm}
        onClose={() => handoverLog.setShowRestoreConfirm(false)}
        onConfirm={() => {
          handoverLog.setShowRestoreConfirm(false)
          if (handoverLog.restoreLogId) {
            void handoverLog.restoreHandover(handoverLog.restoreLogId)
          }
        }}
        title="Restore Handover"
        message="Are you sure you want to restore this handover? The handover log will be removed, the item will become available again, and the previous approved claim will be cancelled."
        confirmText="Yes, Restore"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  )
}
