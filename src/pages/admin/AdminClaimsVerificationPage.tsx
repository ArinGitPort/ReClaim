import { useSearchParams } from "react-router-dom"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ClaimWorkspace, ClaimsQueue, DenyClaimModal, useClaimsVerification } from "@/features/admin/claims-verification"

export function ClaimsVerificationPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const claimsVerification = useClaimsVerification(focusCode, searchParams.get("status"))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Claims Verification</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Review incoming gallery claims before any pickup handover is allowed.</p>
      </div>

      {claimsVerification.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {claimsVerification.error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <ClaimsQueue
          claims={claimsVerification.filteredClaims}
          isLoading={claimsVerification.isLoading}
          selectedClaimId={claimsVerification.selectedClaimId}
          search={claimsVerification.search}
          statusFilter={claimsVerification.statusFilter}
          page={claimsVerification.page}
          pageCount={claimsVerification.pageCount}
          totalClaims={claimsVerification.totalClaims}
          rowsPerPage={claimsVerification.rowsPerPage}
          onSearchChange={(value) => {
            claimsVerification.setSearch(value)
            claimsVerification.setPage(1)
          }}
          onStatusFilterChange={claimsVerification.setStatusFilter}
          onSelectClaim={claimsVerification.setSelectedClaimId}
          onPageChange={claimsVerification.setPage}
          hasUnreadMessage={claimsVerification.claimHasUnreadMessage}
          onRowsPerPageChange={(nextRows) => {
            claimsVerification.setRowsPerPage(nextRows)
            claimsVerification.setPage(1)
          }}
        />

        <ClaimWorkspace
          claim={claimsVerification.selectedClaim}
          isLoading={claimsVerification.isLoading}
          isSubmitting={claimsVerification.isSubmitting}
          hasUnreadMessage={claimsVerification.selectedClaimHasUnreadMessage}
          onMessagesViewed={claimsVerification.markSelectedClaimMessagesViewed}
          onRequestDecision={claimsVerification.requestDecision}
        />
      </div>

      <ConfirmModal
        isOpen={claimsVerification.pendingDecision === "APPROVED"}
        onClose={() => !claimsVerification.isSubmitting && claimsVerification.setPendingDecision(null)}
        onConfirm={() => void claimsVerification.confirmDecision()}
        title={claimsVerification.decisionConfig?.title ?? ""}
        message={claimsVerification.decisionConfig?.message ?? ""}
        confirmText={claimsVerification.decisionConfig?.confirmText ?? "Confirm"}
        cancelText="Cancel"
        isDestructive={claimsVerification.decisionConfig?.isDestructive ?? false}
        isLoading={claimsVerification.isSubmitting}
      />

      <DenyClaimModal
        isOpen={claimsVerification.pendingDecision === "DENIED"}
        claim={claimsVerification.selectedClaim}
        reviewerNote={claimsVerification.denialNote}
        isLoading={claimsVerification.isSubmitting}
        onReviewerNoteChange={claimsVerification.setDenialNote}
        onClose={() => !claimsVerification.isSubmitting && claimsVerification.setPendingDecision(null)}
        onConfirm={() => void claimsVerification.confirmDecision()}
      />
    </div>
  )
}
