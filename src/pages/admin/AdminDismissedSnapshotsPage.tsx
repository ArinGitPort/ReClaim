import { useState, useMemo, useEffect } from "react"
import { ScanSearch, Camera, MapPin, Clock, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListFilters, AdminListHeader, AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { api } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"

type AISnapshot = {
  id: string
  sourceCameraId: string
  snapshotPath: string
  detectedAtUtc: string
  dismissedAt: string
  detectionMeta: {
    category?: string
    confidence?: number
    location?: string
  }
}

export function DismissedSnapshotsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [confidenceFilter, setConfidenceFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [snapshots, setSnapshots] = useState<AISnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSnapshot, setSelectedSnapshot] = useState<AISnapshot | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoreConfirmSnapshot, setRestoreConfirmSnapshot] = useState<AISnapshot | null>(null)

  const loadSnapshots = async () => {
    try {
      const response = await api.get<{ snapshots: AISnapshot[] }>("/snapshots/dismissed")
      setSnapshots(response.data.snapshots)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSnapshots()
  }, [])

  const handleRestore = async (id: string) => {
    setRestoringId(id)
    try {
      await api.post(`/snapshots/${id}/restore`)
      setSnapshots(prev => prev.filter(s => s.id !== id))
      setSelectedSnapshot(null)
      setRestoreConfirmSnapshot(null)
    } catch {
      alert("Failed to restore snapshot")
    } finally {
      setRestoringId(null)
    }
  }

  // Filtering logic
  const filteredSnapshots = useMemo(() => {
    return snapshots.filter(s => {
      const meta = s.detectionMeta || {}
      const cat = meta.category || ""
      const loc = meta.location || s.sourceCameraId || ""
      const conf = (meta.confidence || 0) * 100

      if (searchQuery && !cat.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (locationFilter && loc !== locationFilter) return false
      
      if (confidenceFilter) {
        if (confidenceFilter === "high" && conf < 90) return false
        if (confidenceFilter === "medium" && conf < 75) return false
      }
      return true
    })
  }, [snapshots, searchQuery, locationFilter, confidenceFilter])

  const uniqueLocations = Array.from(new Set(snapshots.map(s => (s.detectionMeta || {}).location || s.sourceCameraId)))

  useEffect(() => {
    setPage(1)
  }, [searchQuery, locationFilter, confidenceFilter, rowsPerPage])

  const pageCount = Math.max(1, Math.ceil(filteredSnapshots.length / rowsPerPage))
  const paginatedSnapshots = filteredSnapshots.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Dismissed Snapshots"
        description="Archive of AI snapshots dismissed as false alarms. Restore to move back to the review queue."
        actions={(
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" />
            Dismissed: {snapshots.length}
          </div>
        )}
      />

      <div className="space-y-3">
        <AdminListFilters>
          <AdminSearchInput
            placeholder="Search by predicted category..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <div className="w-full md:w-56">
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </Select>
          </div>

          <div className="w-full md:w-56">
            <Select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
            >
              <option value="">Any Confidence</option>
              <option value="high">&gt; 90% Confidence</option>
              <option value="medium">&gt; 75% Confidence</option>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600"
            disabled={!searchQuery && !locationFilter && !confidenceFilter}
            onClick={() => {
              setSearchQuery("")
              setLocationFilter("")
              setConfidenceFilter("")
              setPage(1)
            }}
          >
            Reset
          </Button>
        </AdminListFilters>
      </div>

      {isLoading ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-semibold">Loading dismissed snapshots...</p>
        </div>
      ) : filteredSnapshots.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <ScanSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No dismissed snapshots</h3>
          <p className="text-sm text-slate-500">Snapshots dismissed as false alarms will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedSnapshots.map(snapshot => (
              <div 
                key={snapshot.id} 
                onClick={() => setSelectedSnapshot(snapshot)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col opacity-80 hover:opacity-100"
              >
                {/* Image */}
                <div className="w-full h-32 bg-slate-100 border-b border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                  {snapshot.snapshotPath ? (
                    <img src={getImageUrl(snapshot.snapshotPath)} alt="Snapshot" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] font-medium uppercase tracking-widest">No Preview</span>
                    </>
                  )}
                  
                  {/* Confidence Badge */}
                  <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded shadow-sm text-[8px] font-extrabold uppercase tracking-widest border ${
                    ((snapshot.detectionMeta || {}).confidence || 0) * 100 >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
                    ((snapshot.detectionMeta || {}).confidence || 0) * 100 >= 75 ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {Math.round(((snapshot.detectionMeta || {}).confidence || 0) * 100)}% Match
                  </div>

                  {/* Dismissed overlay */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[8px] font-extrabold uppercase tracking-widest text-rose-600">
                    Dismissed
                  </div>
                </div>
                
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors capitalize truncate">
                    {(snapshot.detectionMeta || {}).category || "Unknown"}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{new Date(snapshot.detectedAtUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-semibold text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{(snapshot.detectionMeta || {}).location || snapshot.sourceCameraId}</span>
                  </div>
                  {snapshot.dismissedAt && (
                    <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{new Date(snapshot.dismissedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            page={page}
            pageCount={pageCount}
            total={filteredSnapshots.length}
            visibleCount={paginatedSnapshots.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            itemLabel="snapshots"
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Detail modal */}
      {selectedSnapshot && (
        <Modal isOpen={true} onClose={() => setSelectedSnapshot(null)} className="max-w-3xl flex flex-col max-h-[90vh]">
          <ModalHeader
            title="Dismissed Snapshot"
            icon={<Camera className="w-5 h-5 text-white" />}
            onClose={() => setSelectedSnapshot(null)}
          />

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Large Image Preview */}
            <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative min-h-75 shadow-inner">
              {selectedSnapshot.snapshotPath ? (
                <img 
                  src={getImageUrl(selectedSnapshot.snapshotPath)}
                  alt="Snapshot" 
                  className="w-full h-auto max-h-125 object-contain" 
                />
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <Camera className="w-12 h-12 mb-3 opacity-50" />
                  <span className="text-sm font-bold uppercase tracking-widest">Image Unavailable</span>
                </div>
              )}
              
              <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg shadow-sm text-xs font-extrabold uppercase tracking-widest border ${
                Math.round(((selectedSnapshot.detectionMeta || {}).confidence || 0) * 100) >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
                Math.round(((selectedSnapshot.detectionMeta || {}).confidence || 0) * 100) >= 75 ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {Math.round(((selectedSnapshot.detectionMeta || {}).confidence || 0) * 100)}% Match
              </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Detected Object</p>
                <p className="text-lg font-bold text-slate-900 capitalize">{(selectedSnapshot.detectionMeta || {}).category || "Unknown Object"}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Time Detected</p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-brand" />
                  {new Date(selectedSnapshot.detectedAtUtc).toLocaleString()}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Location / Camera</p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MapPin className="w-4 h-4 text-brand" />
                  {(selectedSnapshot.detectionMeta || {}).location || selectedSnapshot.sourceCameraId}
                </div>
              </div>
            </div>

            {/* Dismissed info */}
            {selectedSnapshot.dismissedAt && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">
                <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-800">Dismissed as False Alarm</p>
                  <p className="text-[11px] font-semibold text-rose-600 mt-0.5">
                    {new Date(selectedSnapshot.dismissedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <Button
              type="button"
              onClick={() => setSelectedSnapshot(null)}
              className="flex-1 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl uppercase tracking-widest text-xs shadow-sm transition-all"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => setRestoreConfirmSnapshot(selectedSnapshot)}
              disabled={restoringId === selectedSnapshot.id}
              className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl uppercase tracking-widest text-xs shadow-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore to Gallery
            </Button>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!restoreConfirmSnapshot}
        onClose={() => !restoringId && setRestoreConfirmSnapshot(null)}
        onConfirm={() => restoreConfirmSnapshot && void handleRestore(restoreConfirmSnapshot.id)}
        title="Restore Snapshot"
        message="Restore this dismissed snapshot back to the review queue?"
        confirmText="Restore"
        cancelText="Cancel"
        isDestructive={false}
        isLoading={!!restoringId}
      />
    </div>
  )
}
