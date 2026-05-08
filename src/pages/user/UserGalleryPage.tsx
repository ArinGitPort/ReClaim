import { useState, useEffect } from "react"
import { UniversalFilterBar } from "@/components/ui/UniversalFilterBar"
import { GalleryGrid } from "@/features/gallery/GalleryGrid"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { Tag, MapPin, Calendar } from "lucide-react"

export function GalleryPage() {
  const [itemCount, setItemCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  // Filter States
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")

  const pageSize = 12

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [search, category, date, location])

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

      <UniversalFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search for lost items..."
        dropdowns={[
          {
            id: "category",
            label: "Category",
            icon: <Tag />,
            value: category,
            onChange: setCategory,
            options: [
              { label: "All Categories", value: "" },
              { label: "Electronics", value: "Electronics" },
              { label: "Wallets & IDs", value: "Wallets & IDs" },
              { label: "Clothing", value: "Clothing" },
              { label: "Bags & Backpacks", value: "Bags & Backpacks" },
              { label: "Keys", value: "Keys" },
              { label: "Other", value: "Everyday Items" }
            ],
          },
          {
            id: "date",
            label: "Time Frame",
            icon: <Calendar />,
            value: date,
            onChange: setDate,
            options: [
              { label: "Any Time", value: "" },
              { label: "Today", value: "today" },
              { label: "Last 7 Days", value: "7days" },
              { label: "Last 30 Days", value: "30days" }
            ],
          },
          {
            id: "location",
            label: "Location",
            icon: <MapPin />,
            value: location,
            onChange: setLocation,
            options: [
              { label: "Everywhere", value: "" },
              { label: "Main Library", value: "library" },
              { label: "Student Union", value: "union" },
              { label: "Gymnasium", value: "gym" }
            ],
          }
        ]}
        onClear={search || category || date || location ? () => {
          setSearch("")
          setCategory("")
          setDate("")
          setLocation("")
        } : undefined}
      />

      <div className="w-full relative">
        <GalleryGrid
          page={page}
          pageSize={pageSize}
          search={search}
          category={category}
          date={date}
          location={location}
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

