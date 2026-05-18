import { useState } from "react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import {
  DismissedSnapshotDetailsModal,
  SnapshotEmptyState,
  SnapshotFilters,
  SnapshotGrid,
  SnapshotLoadingState,
  useSnapshotCollection,
  type AISnapshot,
} from "@/features/admin/snapshots"
import { api } from "@/lib/api"

export function DismissedSnapshotsPage() {
  const snapshots = useSnapshotCollection({ endpoint: "/snapshots/dismissed" })
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoreConfirmSnapshot, setRestoreConfirmSnapshot] = useState<AISnapshot | null>(null)

  const handleRestore = async (id: string) => {
    setRestoringId(id)
    try {
      await api.post(`/snapshots/${id}/restore`)
      snapshots.removeSnapshot(id)
      snapshots.setSelectedSnapshot(null)
      setRestoreConfirmSnapshot(null)
    } catch {
      alert("Failed to restore snapshot")
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Dismissed Snapshots"
        description="Archive of AI snapshots dismissed as false alarms. Restore to move back to the review queue."
        actions={<AdminExportButton disabled={snapshots.snapshots.length === 0} />}
      />

      <div className="space-y-3">
        <SnapshotFilters
          searchQuery={snapshots.searchQuery}
          locationFilter={snapshots.locationFilter}
          confidenceFilter={snapshots.confidenceFilter}
          uniqueLocations={snapshots.uniqueLocations}
          hasActiveFilters={snapshots.hasActiveFilters}
          onSearchChange={snapshots.setSearchQuery}
          onLocationChange={snapshots.setLocationFilter}
          onConfidenceChange={snapshots.setConfidenceFilter}
          onReset={snapshots.resetFilters}
        />
      </div>

      {snapshots.isLoading ? (
        <SnapshotLoadingState message="Loading dismissed snapshots..." />
      ) : snapshots.filteredSnapshots.length === 0 ? (
        <SnapshotEmptyState
          title="No dismissed snapshots"
          description="Snapshots dismissed as false alarms will appear here."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <SnapshotGrid
            snapshots={snapshots.paginatedSnapshots}
            variant="dismissed"
            onSelect={snapshots.setSelectedSnapshot}
          />

          <PaginationControls
            page={snapshots.page}
            pageCount={snapshots.pageCount}
            total={snapshots.filteredSnapshots.length}
            visibleCount={snapshots.paginatedSnapshots.length}
            rowsPerPage={snapshots.rowsPerPage}
            onPageChange={snapshots.setPage}
            onRowsPerPageChange={snapshots.setRowsPerPage}
            itemLabel="snapshots"
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      <DismissedSnapshotDetailsModal
        snapshot={snapshots.selectedSnapshot}
        restoringId={restoringId}
        onClose={() => snapshots.setSelectedSnapshot(null)}
        onRestoreClick={setRestoreConfirmSnapshot}
      />

      <ConfirmModal
        isOpen={Boolean(restoreConfirmSnapshot)}
        onClose={() => !restoringId && setRestoreConfirmSnapshot(null)}
        onConfirm={() => restoreConfirmSnapshot && void handleRestore(restoreConfirmSnapshot.id)}
        title="Restore Snapshot"
        message="Restore this dismissed snapshot back to the review queue?"
        confirmText="Restore"
        cancelText="Cancel"
        isDestructive={false}
        isLoading={Boolean(restoringId)}
      />
    </div>
  )
}
