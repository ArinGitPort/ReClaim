import { useState, useMemo, useEffect } from "react"
import { ScanSearch, Camera, AlertCircle, Check, Trash2, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListFilters, AdminListHeader, AdminSearchInput } from "@/features/admin/components/admin-list-layout"

// Mock snapshot data
type AISnapshot = {
  id: string
  imageUrl: string
  timestampStr: string
  location: string
  predictedCategory: string
  confidenceScore: number
}

const MOCK_SNAPSHOTS: AISnapshot[] = [
  { id: "snp_1", imageUrl: "", timestampStr: "Today, 08:15 AM", location: "Main Library Gate", predictedCategory: "Backpack", confidenceScore: 94 },
  { id: "snp_2", imageUrl: "", timestampStr: "Today, 09:30 AM", location: "Student Union Hall", predictedCategory: "Water Bottle", confidenceScore: 82 },
  { id: "snp_3", imageUrl: "", timestampStr: "Today, 11:45 AM", location: "Engineering Bldg Corridor", predictedCategory: "Laptop/Tablet", confidenceScore: 98 },
  { id: "snp_4", imageUrl: "", timestampStr: "Yesterday, 04:20 PM", location: "Main Library Gate", predictedCategory: "Smartphone", confidenceScore: 76 },
  { id: "snp_5", imageUrl: "", timestampStr: "Yesterday, 05:10 PM", location: "Cafeteria Entrance", predictedCategory: "Jacket", confidenceScore: 88 },
]

export function SnapshotGalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [confidenceFilter, setConfidenceFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Filtering logic
  const filteredSnapshots = useMemo(() => {
    return MOCK_SNAPSHOTS.filter(s => {
      if (searchQuery && !s.predictedCategory.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (locationFilter && s.location !== locationFilter) return false
      
      if (confidenceFilter) {
        if (confidenceFilter === "high" && s.confidenceScore < 90) return false
        if (confidenceFilter === "medium" && s.confidenceScore < 75) return false
      }
      return true
    })
  }, [searchQuery, locationFilter, confidenceFilter])

  // Get unique locations config
  const uniqueLocations = Array.from(new Set(MOCK_SNAPSHOTS.map(s => s.location)))

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
            Unreviewed Items: {MOCK_SNAPSHOTS.length}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSnapshots.map(snapshot => (
              <div key={snapshot.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-slate-100 border-b border-slate-200 flex flex-col items-center justify-center text-slate-400 relative">
                  <Camera className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs font-medium uppercase tracking-widest">Snapshot preview hidden</span>
                  
                  {/* Confidence Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded shadow-sm text-[10px] font-extrabold uppercase tracking-widest border ${
                    snapshot.confidenceScore >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
                    snapshot.confidenceScore >= 75 ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {snapshot.confidenceScore}% Match
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand transition-colors">
                      {snapshot.predictedCategory}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {snapshot.timestampStr}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {snapshot.location}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 mt-auto">
                    <Button className="h-9 px-0 w-full bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold border-none shadow-none uppercase tracking-widest text-[10px]">
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Dismiss
                    </Button>
                    <Button className="h-9 px-0 w-full bg-brand hover:bg-brand-active text-white font-bold border-none shadow-sm uppercase tracking-widest text-[10px]">
                      <Check className="w-3.5 h-3.5 mr-1.5" /> Log Found
                    </Button>
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
    </div>
  )
}
