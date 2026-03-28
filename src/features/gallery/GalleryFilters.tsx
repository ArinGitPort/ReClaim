import { Search, MapPin, Tag, SlidersHorizontal, X, ChevronDown, Calendar } from "lucide-react"
import { useState } from "react"

export function GalleryFilters() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Horizontal Filter Bar - Transparent Container */}
      <div className="hidden md:flex items-center gap-3 mb-8 w-full">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-secondary group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            placeholder="Search for lost items..."
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary transition-all shadow-sm placeholder:text-text-secondary/70 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Selects for better UX */}
          <div className="relative group">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand pointer-events-none transition-colors" />
            <select className="appearance-none py-2.5 pl-9 pr-10 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary cursor-pointer transition-all shadow-sm font-medium hover:bg-background-subtle/50">
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="wallets">Wallets & IDs</option>
              <option value="clothing">Clothing</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          <div className="relative group">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand pointer-events-none transition-colors" />
            <select className="appearance-none py-2.5 pl-9 pr-10 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary cursor-pointer transition-all shadow-sm font-medium hover:bg-background-subtle/50">
              <option value="any">Any Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          <div className="relative group">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand pointer-events-none transition-colors" />
            <select className="appearance-none py-2.5 pl-9 pr-10 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary cursor-pointer transition-all shadow-sm font-medium hover:bg-background-subtle/50">
              <option value="everywhere">Everywhere</option>
              <option value="library">Main Library</option>
              <option value="union">Student Union</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          <button 
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-status-error hover:bg-status-error/10 hover:border-status-error/30 rounded-lg transition-colors bg-background-app border border-transparent shadow-sm mx-1"
            title="Clear filters"
          >
            Clear
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Filters Button */}
      <div className="md:hidden mb-4 flex gap-2">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:border-brand focus:ring-brand/20 text-text-primary shadow-sm"
          />
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 bg-background-app border border-border-divider rounded-lg text-text-primary hover:bg-background-subtle shadow-sm transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Filters Slide-out Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-background-app shadow-2xl p-6 flex flex-col animate-in slide-in-from-right-full duration-200 border-l border-border-divider">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Filters</h2>     
              <button onClick={() => setIsOpen(false)} className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-subtle transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                <label className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wide">
                  <Tag className="w-4 h-4 text-brand" />
                  Category
                </label>
                <div className="space-y-3">
                  {["Electronics", "Wallets & IDs", "Clothing", "Bags", "Other"].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 group cursor-pointer">       
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="peer w-5 h-5 rounded border border-border-divider appearance-none checked:bg-brand checked:border-brand transition-colors cursor-pointer shadow-sm" />
                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{cat}</span>     
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-brand" />
                  Location
                </label>
                <div className="relative">
                  <select className="w-full appearance-none h-11 px-4 pr-10 text-sm bg-background-app border border-border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary font-medium shadow-sm transition-colors cursor-pointer hover:bg-background-subtle/50">
                    <option value="all">Everywhere on Campus</option>
                    <option value="library">Main Library</option>
                    <option value="union">Student Union</option>
                    <option value="gym">Gymnasium</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border-divider gap-3 flex flex-col">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-brand text-white text-sm font-bold rounded-xl shadow-sm hover:bg-brand-dark hover:shadow transition-all"
              >
                Apply Filters
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-sm font-bold text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-xl transition-all"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

