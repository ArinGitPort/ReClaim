import { useSearchParams } from "react-router-dom"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import {
  MissingReportLinkModal,
  MissingReportsQueue,
  MissingReportWorkspace,
  useMissingItems,
} from "@/features/admin/missing-items"

export function MissingItemsPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const missingItems = useMissingItems(focusCode)

  return (
    <div className="space-y-8">
      <MissingReportLinkModal
        isOpen={missingItems.showLinker}
        report={missingItems.report}
        selectedReportId={missingItems.selectedReport}
        onClose={() => missingItems.setShowLinker(false)}
        onLinked={missingItems.markLinked}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Missing Items</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Monitor and verify incoming student lost reports against system records.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <MissingReportsQueue
          reports={missingItems.triageReports}
          isLoading={missingItems.isLoading}
          selectedReportId={missingItems.selectedReport}
          focusCode={focusCode}
          searchQuery={missingItems.searchQuery}
          categoryFilter={missingItems.categoryFilter}
          page={missingItems.page}
          pageCount={missingItems.pageCount}
          totalReports={missingItems.totalReports}
          rowsPerPage={missingItems.rowsPerPage}
          onSearchChange={(value) => {
            missingItems.setSearchQuery(value)
            missingItems.setPage(1)
          }}
          onCategoryChange={(category) => {
            missingItems.setCategoryFilter(category)
            missingItems.setPage(1)
          }}
          onSelectReport={missingItems.setSelectedReport}
          onPageChange={missingItems.setPage}
          onRowsPerPageChange={(nextRows) => {
            missingItems.setRowsPerPage(nextRows)
            missingItems.setPage(1)
          }}
        />

        <MissingReportWorkspace
          report={missingItems.report}
          isUpdating={missingItems.isUpdating}
          error={missingItems.error}
          isPrivateNoteVisible={missingItems.isPrivateNoteVisible}
          onRevealPrivateNote={missingItems.setPrivateNoteVisibility}
          onOpenLinker={() => missingItems.setShowLinker(true)}
          onReject={() => missingItems.setIsRejectConfirmOpen(true)}
          onUpdateStatus={(status) => void missingItems.updateReportStatus(status)}
        />
      </div>

      <ConfirmModal
        isOpen={missingItems.isRejectConfirmOpen}
        onClose={() => !missingItems.isUpdating && missingItems.setIsRejectConfirmOpen(false)}
        onConfirm={() => void missingItems.rejectSelectedReport()}
        title="Reject Report"
        message={`Reject report ${missingItems.report?.code ?? ""}? This action cannot be undone and will close the review.`}
        confirmText="Reject"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={missingItems.isUpdating}
      />
    </div>
  )
}
