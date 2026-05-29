import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleDismiss = async (id: string) => {
    try {
      await api.delete(`/snapshots/${id}`)
      snapshots.removeSnapshot(id)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
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
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(snapshot.id)
        return next
      })
    } catch {
      alert("Failed to log item")
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(snapshots.filteredSnapshots.map((s) => s.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleBulkDismiss = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      await api.post("/snapshots/batch-dismiss", { snapshotIds: ids })
      ids.forEach((id) => snapshots.removeSnapshot(id))
      setSelectedIds(new Set())
      alert(`Successfully dismissed ${ids.length} snapshots.`)
    } catch {
      alert("Failed to bulk dismiss snapshots")
    }
  }

  const handleBulkLogFound = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      await api.post("/snapshots/batch-log-found", { snapshotIds: ids })
      ids.forEach((id) => snapshots.removeSnapshot(id))
      setSelectedIds(new Set())
      alert(`Successfully logged ${ids.length} items to inventory.`)
    } catch {
      alert("Failed to bulk log items")
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
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="select-all-snapshots"
                checked={selectedIds.size === snapshots.filteredSnapshots.length && snapshots.filteredSnapshots.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4.5 h-4.5 text-brand border-slate-300 rounded focus:ring-brand cursor-pointer"
              />
              <label htmlFor="select-all-snapshots" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Select All ({snapshots.filteredSnapshots.length} Snapshots)
              </label>
            </div>
            {selectedIds.size > 0 && (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {selectedIds.size} Selected
              </span>
            )}
          </div>

          <SnapshotGrid 
            snapshots={snapshots.paginatedSnapshots} 
            onSelect={snapshots.setSelectedSnapshot} 
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
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

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center justify-between gap-6 z-50 animate-in slide-in-from-bottom-6 duration-300 w-full max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-6 px-2.5 rounded-full bg-brand/10 text-brand font-black text-[10px] uppercase flex items-center justify-center tracking-wider">
              {selectedIds.size} Selected
            </span>
            <button
              onClick={() => handleSelectAll(false)}
              className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              Clear Selection
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDismiss}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Bulk Dismiss
            </Button>
            <Button
              size="sm"
              onClick={handleBulkLogFound}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
            >
              Bulk Log as Found
            </Button>
          </div>
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
