import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { MatchHistoryTable, useMatchHistory, MatchHistoryFilters, MatchHistoryDetailsModal } from "@/features/admin/match-history"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"
import { mapReportRow, type ApiReportRow } from "@/features/admin/missing-items/useMissingItems"

export function MatchHistoryPage() {
  const matchHistory = useMatchHistory()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <MatchHistoryDetailsModal
        report={matchHistory.selectedReport}
        isUpdating={matchHistory.isUpdating}
        onClose={() => matchHistory.setSelectedReport(null)}
        onUnlinkClick={(id) => {
          matchHistory.setUnlinkReportId(id)
          matchHistory.setShowUnlinkConfirm(true)
        }}
      />

      <AdminListHeader
        title="Match History"
        description="Review all successfully matched reports and unlink them if necessary."
        actions={(
          <AdminExportButton
            title="Match History Export"
            filename="reclaim-match-history"
            disabled={!matchHistory.reports.length}
            filters={[
              { label: "Search", value: matchHistory.searchQuery || "All" },
              { label: "Category", value: matchHistory.categoryFilter || "All" },
              { label: "Status", value: "MATCHED" },
            ]}
            fetchRows={async () => {
              const rows = await fetchAllPages<ApiReportRow>({
                endpoint: "/reports",
                dataKey: "reports",
                params: {
                  statusIn: "MATCHED",
                  search: matchHistory.searchQuery.trim() || undefined,
                  category: matchHistory.categoryFilter || undefined,
                },
              })
              return rows.map(mapReportRow)
            }}
            getRowDate={(report) => report.reportedLostAtUtcRaw}
            columns={[
              { header: "Report Code", getValue: (report) => report.code },
              { header: "Student", getValue: (report) => report.student },
              { header: "Student ID", getValue: (report) => report.studentId, sensitive: true },
              { header: "Lost Item", getValue: (report) => report.item },
              { header: "Category", getValue: (report) => report.category },
              { header: "Report Status", getValue: (report) => report.status },
              { header: "Reported Lost At", getValue: (report) => formatExportDate(report.reportedLostAtUtcRaw) },
              { header: "Matched Item Code", getValue: (report) => report.linkedItem?.code },
              { header: "Matched Item", getValue: (report) => report.linkedItem?.title },
            ]}
          />
        )}
      />

      <div className="space-y-3">
        <MatchHistoryFilters
          search={matchHistory.searchQuery}
          categoryFilter={matchHistory.categoryFilter}
          onSearchChange={(val) => {
            matchHistory.setSearchQuery(val)
            matchHistory.setPage(1)
          }}
          onCategoryChange={(val) => {
            matchHistory.setCategoryFilter(val)
            matchHistory.setPage(1)
          }}
          onReset={matchHistory.resetFilters}
        />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
          {matchHistory.totalReports === 1 ? "1 Match Found" : `${matchHistory.totalReports} Matches Found`}
        </p>
      </div>

      <MatchHistoryTable
        reports={matchHistory.reports}
        isLoading={matchHistory.isLoading}
        onSelectReport={matchHistory.setSelectedReport}
      />

      <PaginationControls
        page={matchHistory.page}
        pageCount={matchHistory.pageCount}
        total={matchHistory.totalReports}
        visibleCount={matchHistory.reports.length}
        rowsPerPage={matchHistory.rowsPerPage}
        onPageChange={matchHistory.setPage}
        onRowsPerPageChange={(nextRows) => {
          matchHistory.setRowsPerPage(nextRows)
          matchHistory.setPage(1)
        }}
      />

      <ConfirmModal
        isOpen={matchHistory.showUnlinkConfirm}
        onClose={() => matchHistory.setShowUnlinkConfirm(false)}
        onConfirm={() => {
          matchHistory.setShowUnlinkConfirm(false)
          if (matchHistory.unlinkReportId) {
            void matchHistory.revertMatch(matchHistory.unlinkReportId)
            matchHistory.setSelectedReport(null)
          }
        }}
        title="Unlink Match"
        message="Are you sure you want to unlink this report? This will return the report to the active search queue and make the inventory item available again."
        confirmText="Yes, Unlink"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={matchHistory.isUpdating}
      />
    </div>
  )
}
