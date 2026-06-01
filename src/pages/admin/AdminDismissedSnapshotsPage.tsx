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
import { formatExportDate } from "@/lib/exportUtils"
import { getSnapshotCategory, getSnapshotConfidence, getSnapshotLocation } from "@/features/admin/snapshots"

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
        actions={(
          <AdminExportButton
            title="Dismissed Snapshots Export"
            filename="reclaim-dismissed-snapshots"
            disabled={snapshots.filteredSnapshots.length === 0}
            filters={[
              { label: "Search", value: snapshots.searchQuery || "All" },
              { label: "Location", value: snapshots.locationFilter || "All" },
              { label: "Confidence", value: snapshots.confidenceFilter || "All" },
            ]}
            fetchRows={async () => snapshots.filteredSnapshots}
            image={{
              header: "Snapshot URL",
              getUrl: (snapshot) => snapshot.snapshotPath,
              getAlt: (snapshot) => getSnapshotCategory(snapshot),
            }}
            getRowDate={(snapshot) => snapshot.dismissedAt ?? snapshot.detectedAtUtc}
            columns={[
              { header: "Snapshot ID", getValue: (snapshot) => snapshot.id },
              { header: "Category", getValue: getSnapshotCategory },
              { header: "Camera", getValue: (snapshot) => snapshot.sourceCameraId },
              { header: "Location", getValue: getSnapshotLocation },
              { header: "Confidence", getValue: (snapshot) => `${getSnapshotConfidence(snapshot)}%` },
              { header: "Detected At", getValue: (snapshot) => formatExportDate(snapshot.detectedAtUtc) },
              { header: "Dismissed At", getValue: (snapshot) => formatExportDate(snapshot.dismissedAt) },
            ]}
          />
        )}
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
