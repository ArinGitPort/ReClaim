import { ArrowRight, SlidersHorizontal } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { ReportMessagesModal } from "@/components/ui/ReportMessagesModal"
import { UniversalFilterBar } from "@/components/ui/UniversalFilterBar"
import { RecordsStatusChips } from "@/features/user/RecordsStatusChips"
import { MyReportCard, useMyReports } from "@/features/user/my-reports"

export function MyReportsPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const myReports = useMyReports()

  return (
    <div className="w-full min-h-full pb-24">
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Tracking & Status</h2>
            <p className="text-slate-500 text-sm">View the items you reported lost and their search status.</p>
          </div>
          <Link to="/report-lost" className="flex items-center gap-2 text-sm font-bold text-brand hover:underline">
            File New Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <UniversalFilterBar
          searchValue={myReports.search}
          onSearchChange={(value) => {
            myReports.setSearch(value)
            myReports.setPage(1)
          }}
          searchPlaceholder="Search by report code, item, category, color, or location"
          dropdowns={[
            {
              id: "status",
              icon: <SlidersHorizontal />,
              label: "Status",
              value: myReports.statusFilter,
              onChange: (value) => {
                myReports.setStatusFilter(value)
                myReports.setPage(1)
              },
              options: [{ value: "", label: "All Statuses" }, ...myReports.statusOptions],
            },
          ]}
          onClear={myReports.search || myReports.statusFilter ? () => {
            myReports.setSearch("")
            myReports.setStatusFilter("")
            myReports.setPage(1)
          } : undefined}
        />

        <RecordsStatusChips
          statusValue={myReports.statusFilter}
          onStatusChange={myReports.setStatusFilter}
          statusOptions={myReports.statusOptions}
          resultCount={myReports.filteredReports.length}
        />

        <div className="space-y-4">
          {myReports.visibleReports.map((report) => (
            <MyReportCard
              key={report.id}
              report={report}
              focusCode={focusCode}
              closingTicketId={myReports.closingTicketId}
              onCloseTicket={myReports.setCloseConfirmReport}
              onOpenChat={myReports.setChatReportId}
              hasUnreadMessage={myReports.hasUnreadMessage(report)}
            />
          ))}
          {myReports.visibleReports.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
              No reports match your current filters.
            </div>
          )}
        </div>

        <PaginationControls
          page={myReports.page}
          pageCount={myReports.pageCount}
          total={myReports.filteredReports.length}
          visibleCount={myReports.visibleReports.length}
          rowsPerPage={myReports.rowsPerPage}
          onPageChange={myReports.setPage}
          onRowsPerPageChange={(nextRows) => {
            myReports.setRowsPerPage(nextRows)
            myReports.setPage(1)
          }}
          itemLabel="reports"
        />
      </div>

      {myReports.chatReportId && (
        <ReportMessagesModal
          reportId={myReports.chatReportId}
          isOpen={true}
          onClose={() => myReports.setChatReportId(null)}
          onViewed={() => myReports.markMessagesViewed(myReports.chatReportId!)}
          onMessageSent={myReports.loadReports}
          isReadOnly={!["ACTIVE_SEARCH", "MATCHED"].includes(myReports.filteredReports.find((report) => report.ticketId === myReports.chatReportId)?.rawStatus ?? "")}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(myReports.closeConfirmReport)}
        onClose={() => {
          if (!myReports.closingTicketId) myReports.setCloseConfirmReport(null)
        }}
        onConfirm={() => {
          if (myReports.closeConfirmReport) void myReports.closeTicket(myReports.closeConfirmReport)
        }}
        title="Close Report"
        message={`Close ${myReports.closeConfirmReport?.id ?? "this report"}? This will stop the active search and notify campus staff that you no longer need help with this lost item.`}
        confirmText="Yes, Close Ticket"
        cancelText="Keep Report Open"
        isDestructive={true}
        isLoading={Boolean(myReports.closingTicketId)}
      />
    </div>
  )
}
