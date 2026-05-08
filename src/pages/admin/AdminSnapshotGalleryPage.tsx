import { useState, useMemo, useEffect } from "react"
import { ScanSearch, Camera, AlertCircle, Check, Trash2, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListFilters, AdminListHeader, AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import { SnapshotDetailsModal } from "@/features/admin/modals/SnapshotDetailsModal"
import { api } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"

type AISnapshot = {
  id: string
  sourceCameraId: string
  snapshotPath: string
  detectedAtUtc: string
  detectionMeta: {
    category?: string
    confidence?: number
    location?: string
  }
}

export function SnapshotGalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [confidenceFilter, setConfidenceFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [snapshots, setSnapshots] = useState<AISnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSnapshot, setSelectedSnapshot] = useState<AISnapshot | null>(null)

  const loadSnapshots = async () => {
    try {
      const response = await api.get<{ snapshots: AISnapshot[] }>("/snapshots")
      setSnapshots(response.data.snapshots)
    } catch (err) {
      alert("Failed to load snapshots")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSnapshots()
  }, [])

  const handleDismiss = async (id: string) => {
    try {
      await api.delete(`/snapshots/${id}`)
      setSnapshots(prev => prev.filter(s => s.id !== id))
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
      setSnapshots(prev => prev.filter(s => s.id !== snapshot.id))
    } catch {
      alert("Failed to log item")
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

  // Get unique locations config
  const uniqueLocations = Array.from(new Set(snapshots.map(s => (s.detectionMeta || {}).location || s.sourceCameraId)))

  // Pagination logic
  useEffect(() => {
    setPage(1)
  }, [searchQuery, locationFilter, confidenceFilter, rowsPerPage])

  const pageCount = Math.max(1, Math.ceil(filteredSnapshots.length / rowsPerPage))
  const paginatedSnapshots = filteredSnapshots.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="AI Camera Snapshots"
        description="Review items automatically detected by campus security cameras."
        actions={(
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Unreviewed Items: {snapshots.length}
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

      {filteredSnapshots.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <ScanSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No snapshots found</h3>
          <p className="text-sm text-slate-500">Adjust your filters or check back later.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedSnapshots.map(snapshot => (
              <div 
                key={snapshot.id} 
                onClick={() => setSelectedSnapshot(snapshot)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col"
              >
                {/* Image Placeholder */}
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

      <SnapshotDetailsModal
        isOpen={!!selectedSnapshot}
        onClose={() => setSelectedSnapshot(null)}
        snapshot={selectedSnapshot}
        onDismiss={async (id) => {
          await handleDismiss(id)
          setSelectedSnapshot(null)
        }}
        onLogFound={async (snap) => {
          await handleLogFound(snap)
          setSelectedSnapshot(null)
        }}
      />
    </div>
  )
}
