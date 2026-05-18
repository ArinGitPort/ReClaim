import { AlertCircle } from "lucide-react"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { SnapshotDetailsModal } from "@/features/admin/modals/SnapshotDetailsModal"
import {
  SnapshotEmptyState,
  SnapshotFilters,
  SnapshotGrid,
  useSnapshotCollection,
  type AISnapshot,
} from "@/features/admin/snapshots"
import { api } from "@/lib/api"

export function SnapshotGalleryPage() {
  const snapshots = useSnapshotCollection({
    endpoint: "/snapshots",
    onLoadError: "Failed to load snapshots",
  })

  const handleDismiss = async (id: string) => {
    try {
      await api.delete(`/snapshots/${id}`)
      snapshots.removeSnapshot(id)
    } catch {
      alert("Failed to dismiss snapshot")
    }
  }

  const handleLogFound = async (snapshot: AISnapshot) => {
    try {
      await api.post(`/snapshots/${snapshot.id}/log-found`, {
        title: snapshot.detectionMeta.category || "AI Detected Item",
        category: snapshot.detectionMeta.category || "Other",
        color: "Unknown",
        foundLocation: snapshot.detectionMeta.location || snapshot.sourceCameraId,
      })
      alert("Item successfully logged into inventory")
      snapshots.removeSnapshot(snapshot.id)
    } catch {
      alert("Failed to log item")
    }
  }

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="AI Snapshot Gallery"
        description="Review items automatically detected by campus security cameras."
        actions={(
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Unreviewed Items: {snapshots.snapshots.length}
          </div>
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

      {snapshots.filteredSnapshots.length === 0 ? (
        <SnapshotEmptyState
          title="No snapshots found"
          description="Adjust your filters or check back later."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <SnapshotGrid snapshots={snapshots.paginatedSnapshots} onSelect={snapshots.setSelectedSnapshot} />

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

      <SnapshotDetailsModal
        isOpen={Boolean(snapshots.selectedSnapshot)}
        onClose={() => snapshots.setSelectedSnapshot(null)}
        snapshot={snapshots.selectedSnapshot}
        onDismiss={async (id) => {
          await handleDismiss(id)
          snapshots.setSelectedSnapshot(null)
        }}
        onLogFound={async (snapshot) => {
          await handleLogFound(snapshot)
          snapshots.setSelectedSnapshot(null)
        }}
      />
    </div>
  )
}
