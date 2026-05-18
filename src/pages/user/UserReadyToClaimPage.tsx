import { PaginationControls } from "@/components/ui/PaginationControls"
import {
  ReadyToClaimCard,
  ReadyToClaimFilters,
  useReadyToClaim,
} from "@/features/user/ready-to-claim"

export function ReadyToClaimPage() {
  const wallet = useReadyToClaim()

  return (
    <div className="w-full min-h-full pb-24">
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Token Wallet</h2>
          <p className="text-slate-500 text-sm">This is the only page where pickup tokens are displayed for physical handover.</p>
        </div>

        <ReadyToClaimFilters
          search={wallet.search}
          sourceFilter={wallet.sourceFilter}
          resultCount={wallet.filteredPickups.length}
          onSearchChange={wallet.setSearch}
          onSourceChange={wallet.setSourceFilter}
        />

        <div className="space-y-4">
          {wallet.visiblePickups.map((pickup) => (
            <ReadyToClaimCard
              key={`${pickup.source}-${pickup.sourceCode}`}
              pickup={pickup}
              now={wallet.now}
              onReroll={wallet.handleReroll}
            />
          ))}

          {wallet.visiblePickups.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
              No ready-for-pickup items yet.
            </div>
          )}
        </div>

        <PaginationControls
          page={wallet.page}
          pageCount={wallet.pageCount}
          total={wallet.filteredPickups.length}
          visibleCount={wallet.visiblePickups.length}
          rowsPerPage={wallet.rowsPerPage}
          onPageChange={wallet.setPage}
          onRowsPerPageChange={(nextRows) => {
            wallet.setRowsPerPage(nextRows)
            wallet.setPage(1)
          }}
          itemLabel="items"
        />
      </div>
    </div>
  )
}
