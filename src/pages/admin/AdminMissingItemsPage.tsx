import { useSearchParams } from "react-router-dom"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ReportMessagesModal } from "@/components/ui/ReportMessagesModal"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import {
  MissingReportLinkModal,
  MissingReportsQueue,
  MissingReportWorkspace,
  useMissingItems,
} from "@/features/admin/missing-items"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"
import { categoryMatchesFilter, mapReportRow, type ApiReportRow } from "@/features/admin/missing-items/useMissingItems"

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

      <AdminListHeader
        title="Missing Items Report"
        description="Monitor and verify incoming student lost reports against system records."
        actions={(
          <AdminExportButton
            title="Missing Items Export"
            filename="reclaim-missing-items"
            disabled={!missingItems.triageReports.length}
            filters={[
              { label: "Search", value: missingItems.searchQuery || "All" },
              { label: "Category", value: missingItems.categoryFilter || "All" },
              { label: "Status", value: "SUBMITTED, UNDER_REVIEW, ACTIVE_SEARCH" },
            ]}
            fetchRows={async () => {
              const rows = await fetchAllPages<ApiReportRow>({
                endpoint: "/reports",
                dataKey: "reports",
                params: {
                  statusIn: "SUBMITTED,UNDER_REVIEW,ACTIVE_SEARCH",
                  search: missingItems.searchQuery.trim() || undefined,
                },
              })
              return rows.map(mapReportRow).filter((row) => categoryMatchesFilter(row.category, missingItems.categoryFilter))
            }}
            image={{
              header: "Evidence URL",
              getUrl: (report) => report.attachmentUrls[0],
              getAlt: (report) => report.item,
            }}
            getRowDate={(report) => report.reportedLostAtUtcRaw}
            columns={[
              { header: "Report Code", getValue: (report) => report.code },
              { header: "Status", getValue: (report) => report.status },
              { header: "Student", getValue: (report) => report.student },
              { header: "Student ID", getValue: (report) => report.studentId, sensitive: true },
              { header: "Item", getValue: (report) => report.item },
              { header: "Category", getValue: (report) => report.category },
              { header: "Color", getValue: (report) => report.color },
              { header: "Location", getValue: (report) => report.location },
              { header: "Lost At", getValue: (report) => formatExportDate(report.reportedLostAtUtcRaw) },
              { header: "Private Proof Note", getValue: (report) => report.privateNote, sensitive: true },
            ]}
            sensitiveDescription="This missing-report export can include student identifiers and private proof notes. Continue only for authorized report review."
          />
        )}
      />

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
          onOpenMessages={() => missingItems.report && missingItems.setChatReportId(missingItems.report.id)}
          onReject={() => missingItems.setIsRejectConfirmOpen(true)}
          onUpdateStatus={() => missingItems.setIsAuthorizeConfirmOpen(true)}
          onLinked={(reportId) => missingItems.markLinked(reportId)}
          hasUnreadMessage={missingItems.report ? missingItems.hasUnreadMessage(missingItems.report) : false}
        />
      </div>

      {missingItems.chatReportId && (
        <ReportMessagesModal
          reportId={missingItems.chatReportId}
          isOpen={true}
          onClose={() => missingItems.setChatReportId(null)}
          onViewed={() => missingItems.markMessagesViewed(missingItems.chatReportId!)}
          onMessageSent={() => void missingItems.loadReports(true)}
          isReadOnly={!["ACTIVE_SEARCH", "MATCHED"].includes(missingItems.report?.status ?? "")}
        />
      )}

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

      <ConfirmModal
        isOpen={missingItems.isAuthorizeConfirmOpen}
        onClose={() => !missingItems.isUpdating && missingItems.setIsAuthorizeConfirmOpen(false)}
        onConfirm={() => void missingItems.authorizeSelectedReport()}
        title="Authorize Report"
        message={`Authorize report ${missingItems.report?.code ?? ""} for active inventory matching? Staff will be able to link it to found inventory after this step.`}
        confirmText="Yes, Authorize"
        cancelText="Cancel"
        isLoading={missingItems.isUpdating}
        confirmButtonClassName="bg-emerald-600 hover:bg-emerald-700"
      />
    </div>
  )
}
