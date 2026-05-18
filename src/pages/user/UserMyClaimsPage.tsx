import { ArrowRight, SlidersHorizontal } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { Modal } from "@/components/ui/Modal"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { UniversalFilterBar } from "@/components/ui/UniversalFilterBar"
import { ClaimMessagesModal } from "@/components/ui/ClaimMessagesModal"
import { RecordsStatusChips } from "@/features/user/RecordsStatusChips"
import { MyClaimCard, useMyClaims } from "@/features/user/my-claims"

export function MyClaimsPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const myClaims = useMyClaims()

  return (
    <div className="w-full min-h-full pb-24">
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Tracking & Status</h2>
            <p className="text-slate-500 text-sm">View the status of items you have claimed from the gallery.</p>
          </div>
          <Link to="/gallery" className="flex items-center gap-2 text-sm font-bold text-brand hover:underline">
            Browse Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <UniversalFilterBar
          searchValue={myClaims.search}
          onSearchChange={(value) => {
            myClaims.setSearch(value)
            myClaims.setPage(1)
          }}
          searchPlaceholder="Search by item, category, or location"
          dropdowns={[
            {
              id: "status",
              icon: <SlidersHorizontal />,
              label: "Status",
              value: myClaims.statusFilter,
              onChange: (value) => {
                myClaims.setStatusFilter(value)
                myClaims.setPage(1)
              },
              options: [
                { value: "", label: "All Statuses" },
                ...myClaims.statusOptions,
              ],
            },
          ]}
          onClear={myClaims.search || (myClaims.statusFilter !== "ACTIVE" && myClaims.statusFilter !== "") ? () => {
            myClaims.setSearch("")
            myClaims.setStatusFilter("ACTIVE")
            myClaims.setPage(1)
          } : undefined}
        />

        <RecordsStatusChips
          statusValue={myClaims.statusFilter}
          onStatusChange={myClaims.setStatusFilter}
          statusOptions={myClaims.statusOptions}
          resultCount={myClaims.filteredClaims.length}
        />

        <div className="space-y-4">
          {myClaims.visibleClaims.map((claim) => (
            <MyClaimCard
              key={claim.id}
              claim={claim}
              now={myClaims.now}
              focusCode={focusCode}
              closingTicketId={myClaims.closingTicketId}
              rerollingItemId={myClaims.rerollingItemId}
              onPreviewImage={myClaims.setPreviewImageUrl}
              onOpenChat={myClaims.setChatTicketId}
              onCloseTicket={(targetClaim) => void myClaims.closeTicket(targetClaim)}
              onRerollToken={(itemId) => void myClaims.rerollToken(itemId)}
              onMessageSent={myClaims.loadClaims}
            />
          ))}
          {myClaims.visibleClaims.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
              No claims match your current filters.
            </div>
          )}
        </div>

        <PaginationControls
          page={myClaims.page}
          pageCount={myClaims.pageCount}
          total={myClaims.filteredClaims.length}
          visibleCount={myClaims.visibleClaims.length}
          rowsPerPage={myClaims.rowsPerPage}
          onPageChange={myClaims.setPage}
          onRowsPerPageChange={(nextRows) => {
            myClaims.setRowsPerPage(nextRows)
            myClaims.setPage(1)
          }}
          itemLabel="claims"
        />
      </div>

      {myClaims.chatTicketId && (
        <ClaimMessagesModal
          claimId={myClaims.chatTicketId}
          isOpen={true}
          onClose={() => myClaims.setChatTicketId(null)}
          isReadOnly={!["PENDING_VERIFICATION", "INQUIRY_REQUIRED"].includes(myClaims.filteredClaims.find((claim) => claim.ticketId === myClaims.chatTicketId)?.rawStatus ?? "")}
        />
      )}

      {myClaims.previewImageUrl && (
        <Modal
          isOpen={true}
          onClose={() => myClaims.setPreviewImageUrl(null)}
          className="max-w-2xl p-0 overflow-hidden bg-transparent border-0 shadow-none"
        >
          <div className="relative group">
            <img
              src={myClaims.previewImageUrl}
              alt="Preview"
              className="w-full max-h-[80vh] object-contain rounded-2xl bg-black/50"
            />
            <button
              type="button"
              onClick={() => myClaims.setPreviewImageUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-md"
            >
              &times;
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
