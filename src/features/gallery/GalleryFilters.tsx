import { Search, MapPin, Calendar, Tag, SlidersHorizontal } from "lucide-react"

export function GalleryFilters() {
  return (
    <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-8 self-start space-y-8 bg-background-app p-6 rounded-xl border border-border-divider/60 shadow-sm font-sans">
      <div className="flex items-center gap-2 border-b border-border-divider/50 pb-4">
        <SlidersHorizontal className="w-5 h-5 text-text-primary" />
        <h2 className="text-lg font-bold text-text-primary tracking-tight">Filters</h2>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Search className="w-4 h-4 text-text-secondary" />
          Quick Search
        </label>
        <input 
          type="text" 
          placeholder="e.g. Black laptop, keys..." 
          className="w-full h-10 px-3 md:px-4 text-sm bg-background-subtle border border-border-divider/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary placeholder:text-text-secondary"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-secondary" />
          Date Lost
        </label>
        <select className="w-full h-10 px-3 text-sm bg-background-subtle border border-border-divider/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary cursor-pointer">
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Tag className="w-4 h-4 text-text-secondary" />
          Category
        </label>
        <div className="space-y-2.5">
          {["Electronics", "Wallets & IDs", "Clothing & Accessories", "Bags & Backpacks", "Everyday Items"].map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-border-divider text-brand focus:ring-brand bg-background-subtle cursor-pointer" />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <MapPin className="w-4 h-4 text-text-secondary" />
          Campus Location
        </label>
        <select className="w-full h-10 px-3 text-sm bg-background-subtle border border-border-divider/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary cursor-pointer">
          <option value="all">Everywhere</option>
          <option value="library">Main Library</option>
          <option value="student_union">Student Union</option>
          <option value="gym">Gymnasium</option>
        </select>
      </div>

      <button className="w-full py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary bg-background-subtle hover:bg-border-divider/20 rounded-lg transition-colors border border-border-divider/50">
        Clear All Filters
      </button>
    </div>
  )
}
