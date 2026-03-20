import { useState } from "react"
import { GalleryFilters } from "@/features/gallery/GalleryFilters"
import { GalleryGrid } from "@/features/gallery/GalleryGrid"
import { TopNavBar } from "@/layouts/TopNavBar"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CampusDropOffModal } from "@/components/user/CampusDropOffModal"

export function GalleryPage() {
  const [itemCount, setItemCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [showDropOffModal, setShowDropOffModal] = useState(false)

  const pageSize = 12

  return (
    <div className="w-full min-h-full pb-24">
      {/* Top Navigation Bar */}
      <TopNavBar title="Browse Found Items" />

      {/* Main Layout Area */}
      <main className="max-w-[1600px] mx-auto px-6 mt-8">
        {/* Primary Action Banner for Finders */}
        <div className="mb-10 bg-brand rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-brand/10 border border-brand/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black tracking-tight mb-2 italic">Found something?</h2>
              <p className="text-white/80 font-bold text-sm tracking-wide uppercase">
                Return it to its rightful owner via our AI-integrated Smart Drop-Off station.
              </p>
            </div>
            <Button 
              onClick={() => setShowDropOffModal(true)}
              className="bg-white text-brand hover:bg-white/90 font-black px-8 py-6 rounded-2xl text-base shadow-lg shadow-black/5 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <Plus className="w-6 h-6" />
              Turn In a Lost Item
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <GalleryFilters />
          
          <div className="flex-1 w-full relative">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Found Items</h2>
              <span className="text-sm font-medium text-text-secondary bg-background-app px-3 py-1 rounded-full border border-border-divider/40">
                Showing {itemCount} of {totalCount} items
              </span>
            </div>
            
            <GalleryGrid
              page={page}
              pageSize={pageSize}
              onDataChange={({ visibleCount, totalCount: total, pageCount: totalPages }) => {
                setItemCount(visibleCount)
                setTotalCount(total)
                setPageCount(totalPages)
              }}
            />

            <AdminPaginationControls
              className="mt-4"
              page={page}
              pageCount={pageCount}
              total={totalCount}
              visibleCount={itemCount}
              rowsPerPage={pageSize}
              onPageChange={setPage}
              onRowsPerPageChange={() => {
                // Browse Found Items uses fixed public page size.
              }}
              showRowsPerPage={false}
              itemLabel="items"
            />
          </div>
        </div>
      </main>

      {showDropOffModal && (
        <CampusDropOffModal onClose={() => setShowDropOffModal(false)} />
      )}
    </div>
  )
}
