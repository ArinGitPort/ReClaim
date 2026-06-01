import { useSearchParams } from "react-router-dom"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ClaimWorkspace, ClaimsQueue, DenyClaimModal, useClaimsVerification } from "@/features/admin/claims-verification"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"
import type { ClaimRow } from "@/features/admin/claims-verification"

export function ClaimsVerificationPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const claimsVerification = useClaimsVerification(focusCode, searchParams.get("status"))

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Claims Verification"
        description="Review incoming gallery claims before any pickup handover is allowed."
        actions={(
          <AdminExportButton
            title="Claims Verification Export"
            filename="reclaim-claims-verification"
            disabled={!claimsVerification.filteredClaims.length}
            filters={[
              { label: "Search", value: claimsVerification.search || "All" },
              { label: "Status", value: claimsVerification.statusFilter || "PENDING_VERIFICATION, INQUIRY_REQUIRED" },
            ]}
            fetchRows={() => fetchAllPages<ClaimRow>({
              endpoint: "/claims",
              dataKey: "claims",
              params: {
                statusIn: "PENDING_VERIFICATION,INQUIRY_REQUIRED",
                status: claimsVerification.statusFilter || undefined,
                search: claimsVerification.search.trim() || undefined,
              },
            })}
            getRowDate={(claim) => claim.createdAt}
            columns={[
              { header: "Claim Code", getValue: (claim) => claim.claimCode },
              { header: "Status", getValue: (claim) => claim.status },
              { header: "Created At", getValue: (claim) => formatExportDate(claim.createdAt) },
              { header: "Student", getValue: (claim) => claim.claimantUser.name },
              { header: "Student ID", getValue: (claim) => claim.claimantUser.studentId, sensitive: true },
              { header: "Email", getValue: (claim) => claim.claimantUser.email, sensitive: true },
              { header: "Item Code", getValue: (claim) => claim.foundItem.code },
              { header: "Item", getValue: (claim) => claim.foundItem.title },
              { header: "Category", getValue: (claim) => claim.foundItem.category },
              { header: "Proof", getValue: (claim) => claim.submittedProof, sensitive: true },
              { header: "Reviewer Note", getValue: (claim) => claim.reviewerNote, sensitive: true },
            ]}
            sensitiveDescription="This claims export can include ownership proof, student identifiers, and reviewer notes. Continue only for authorized verification work."
          />
        )}
      />

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
