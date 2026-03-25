import { useCallback, useState } from "react"
import { GalleryFilters } from "@/features/gallery/GalleryFilters"
import { GalleryGrid } from "@/features/gallery/GalleryGrid"
import { TopNavBar } from "@/layouts/TopNavBar"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { CampusDropOffModal } from "@/components/user/CampusDropOffModal"
import { useIsMobile } from "@/hooks/useIsMobile"

type GalleryFiltersState = {
  search: string
  dateLost: string
  categories: string[]
  location: string
}

const pageWrapperStyles: React.CSSProperties = { 
  width: '100%', 
  minHeight: '100vh', 
  paddingBottom: '6rem' 
}

const mainContainerStyles: React.CSSProperties = { 
  maxWidth: '100rem', 
  margin: '2rem auto 0', 
  padding: '0 1.5rem' 
}

const bannerWrapperStyles: React.CSSProperties = { 
  marginBottom: '2.5rem', 
  backgroundColor: '#1E2F85', 
  borderRadius: '1.5rem', 
  padding: '2rem', 
  color: '#FFFFFF', 
  position: 'relative', 
  overflow: 'hidden', 
  boxShadow: '0 20px 25px -5px rgba(30, 47, 133, 0.1)', 
  border: '1px solid rgba(30, 47, 133, 0.2)' 
}

const bannerGlowStyles: React.CSSProperties = { 
  position: 'absolute', 
  top: 0, 
  right: 0, 
  width: '24rem', 
  height: '24rem', 
  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
  borderRadius: '50%', 
  filter: 'blur(64px)', 
  transform: 'translate(50%, -50%)', 
  pointerEvents: 'none' 
}

const bannerContentStyles: React.CSSProperties = { 
  position: 'relative', 
  zIndex: 10, 
  display: 'flex', 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  gap: '1.5rem' 
}

const turnInButtonStyles: React.CSSProperties = { 
  backgroundColor: '#FFFFFF', 
  color: '#1E2F85', 
  fontWeight: 900, 
  padding: '0 2rem', 
  height: '4rem', 
  borderRadius: '1rem', 
  fontSize: '1rem', 
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', 
  border: 'none', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.75rem', 
  cursor: 'pointer' 
}

const mainLayoutGridStyles = (isMobile: boolean): React.CSSProperties => ({ 
  display: 'flex', 
  flexDirection: isMobile ? 'column' : 'row', 
  gap: '2rem', 
  alignItems: 'flex-start' 
})

const galleryGridWrapperStyles: React.CSSProperties = { 
  flex: 1, 
  width: '100%', 
  position: 'relative' 
}

const galleryHeaderStyles: React.CSSProperties = { 
  marginBottom: '1.5rem', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between' 
}

const itemCountBadgeStyles: React.CSSProperties = { 
  fontSize: '0.875rem', 
  fontWeight: 500, 
  color: '#64748B', 
  backgroundColor: '#F8FAFC', 
  padding: '0.25rem 0.75rem', 
  borderRadius: '9999px', 
  border: '1px solid rgba(241, 245, 249, 0.4)' 
}

export function GalleryPage() {
  const [itemCount, setItemCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [showDropOffModal, setShowDropOffModal] = useState(false)
  const isMobile = useIsMobile()

  // Filters state
  const [filters, setFilters] = useState<GalleryFiltersState>({
    search: "",
    dateLost: "any",
    categories: [],
    location: "all"
  })

  const handleFiltersChange = useCallback((nextFilters: GalleryFiltersState) => {
    setFilters(nextFilters)
    setPage(1)
  }, [])

  const handleGalleryDataChange = useCallback(
    ({ visibleCount, totalCount: total, pageCount: totalPages }: { visibleCount: number; totalCount: number; pageCount: number }) => {
      setItemCount(visibleCount)
      setTotalCount(total)
      setPageCount(totalPages)
    },
    []
  )

  const pageSize = 12

  return (
    <div style={pageWrapperStyles}>
      {/* Top Navigation Bar */}
      <TopNavBar title="Browse Found Items" />

      {/* Main Layout Area */}
      <main style={mainContainerStyles}>
        {/* Primary Action Banner for Finders */}
        <div style={bannerWrapperStyles}>
          <div style={bannerGlowStyles} />
          <div style={bannerContentStyles}>
            <div style={{ maxWidth: '40rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.5rem', fontStyle: 'italic', margin: 0 }}>Found something?</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold', fontSize: '0.875rem', letterSpacing: '0.025em', textTransform: 'uppercase', margin: 0 }}>
                 Turn in lost items at the ITSO Office and we'll handle the rest.
              </p>
            </div>
            <Button
              onClick={() => setShowDropOffModal(true)}
              style={turnInButtonStyles}
            >
              <Plus style={{ width: '1.5rem', height: '1.5rem' }} />
              Turn In a Lost Item
            </Button>
          </div>
        </div>

        <div style={mainLayoutGridStyles(isMobile)}>
          <div style={{ width: isMobile ? '100%' : 'auto' }}>
            <GalleryFilters filters={filters} setFilters={handleFiltersChange} />
          </div>

          <div style={galleryGridWrapperStyles}>
            <div style={galleryHeaderStyles}>
              <h2 style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>Found Items</h2>
              <span style={itemCountBadgeStyles}>
                Showing {itemCount} of {totalCount} items
              </span>
            </div>

            <GalleryGrid
              page={page}
              pageSize={pageSize}
              filters={filters}
              onDataChange={handleGalleryDataChange}
            />

            <div style={{ marginTop: '1rem' }}>
              <AdminPaginationControls
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
        </div>
      </main>

      {showDropOffModal && (
        <CampusDropOffModal onClose={() => setShowDropOffModal(false)} />
      )}
    </div>
  )
}
