import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { MatchHistoryTable, useMatchHistory, MatchHistoryFilters, MatchHistoryDetailsModal } from "@/features/admin/match-history"

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
