import { useState } from "react"
import { GalleryFilters } from "@/features/gallery/GalleryFilters"
import { GalleryGrid } from "@/features/gallery/GalleryGrid"
import { PaginationControls } from "@/components/ui/PaginationControls"

export function GalleryPage() {
  const [itemCount, setItemCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  const pageSize = 12

  return (
    <div className="w-full min-h-full pb-24">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Found Items</h2>
          <p className="text-sm text-slate-500 mt-1">Browse recently found items across campus.</p>
        </div>
        <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 inline-block w-fit">
          Showing {itemCount} of {totalCount} items
        </span>
      </div>

      <GalleryFilters />

      <div className="w-full relative">
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
          className="mt-8"
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
  )
}

