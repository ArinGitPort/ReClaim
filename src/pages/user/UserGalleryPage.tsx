import { useState } from "react"
import { GalleryFilters } from "@/features/gallery/GalleryFilters"
import { GalleryGrid } from "@/features/gallery/GalleryGrid"
import { TopNavBar } from "@/layouts/TopNavBar"
import { PaginationControls } from "@/components/ui/PaginationControls"

export function GalleryPage() {
  const [itemCount, setItemCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  const pageSize = 12

  return (
    <div className="w-full min-h-full pb-24">
      {/* Top Navigation Bar */}
      <TopNavBar title="Browse Found Items" />

      {/* Main Layout Area */}
      <main className="max-w-400 mx-auto px-6 mt-8">
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

            <PaginationControls
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
    </div>
  )
}
