import { GalleryFilters } from "../features/gallery/GalleryFilters"
import { GalleryGrid } from "../features/gallery/GalleryGrid"
import { ThemeToggle } from "../components/ThemeToggle"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-background-subtle font-sans pb-24">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-background-app/80 backdrop-blur-md border-b border-border-divider/50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-6 w-px bg-border-divider/50 hidden md:block"></div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary hidden md:block">
              Campus Lost & Found
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

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
