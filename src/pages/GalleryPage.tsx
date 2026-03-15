import { GalleryFilters } from "@/features/gallery/GalleryFilters"
import { GalleryGrid } from "@/features/gallery/GalleryGrid"
import { TopNavBar } from "@/components/TopNavBar"

export function GalleryPage() {
  return (
    <div className="w-full min-h-full pb-24">
      {/* Top Navigation Bar */}
      <TopNavBar title="Browse Found Items" />

      {/* Main Layout Area */}
      <main className="max-w-[1600px] mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <GalleryFilters />
          
          <div className="flex-1 w-full relative">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Found Items</h2>
              <span className="text-sm font-medium text-text-secondary bg-background-app px-3 py-1 rounded-full border border-border-divider/40">
                Showing 6 items
              </span>
            </div>
            
            <GalleryGrid />
          </div>
        </div>
      </main>
    </div>
  )
}
