import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export type FilterOption = {
  label: string
  value: string
}

export type FilterDropdown = {
  id: string
  icon: React.ReactNode
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
}

export function UniversalFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  dropdowns = [],
  onClear,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  dropdowns?: FilterDropdown[]
  onClear?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Horizontal Filter Bar - Transparent Container */}
      <div className="hidden md:flex items-center gap-3 mb-8 w-full">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-secondary group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary transition-all shadow-sm placeholder:text-text-secondary/70 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          {dropdowns.map((dropdown) => (
            <div key={dropdown.id} className="relative group min-w-[160px]">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand pointer-events-none transition-colors flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-current">
                {dropdown.icon}
              </div>
              <select
                value={dropdown.value}
                onChange={(e) => dropdown.onChange(e.target.value)}
                className="w-full appearance-none py-2.5 pl-9 pr-10 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary cursor-pointer transition-all shadow-sm font-medium hover:bg-background-subtle/50"
              >
                {dropdown.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
          ))}

          {onClear && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-status-error hover:bg-status-error/10 hover:border-status-error/30 rounded-lg transition-colors bg-background-app border border-transparent shadow-sm mx-1"
              title="Clear filters"
            >
              Clear
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Button */}
      <div className="md:hidden mb-4 flex gap-2">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background-app border border-border-divider rounded-lg focus:outline-none focus:ring-2 focus:border-brand focus:ring-brand/20 text-text-primary shadow-sm"
          />
        </div>
        {dropdowns.length > 0 && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-background-app border border-border-divider rounded-lg text-text-primary hover:bg-background-subtle shadow-sm transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filters Slide-out Modal */}
      {isOpen && dropdowns.length > 0 && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-background-app shadow-2xl p-6 flex flex-col animate-in slide-in-from-right-full duration-200 border-l border-border-divider">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Filters</h2>     
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2">
              {dropdowns.map((dropdown) => (
                <div key={dropdown.id} className="space-y-4">
                  <label className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-4 h-4 text-brand flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-current">
                      {dropdown.icon}
                    </div>
                    {dropdown.label}
                  </label>
                  <div className="relative">
                    <select
                      value={dropdown.value}
                      onChange={(e) => dropdown.onChange(e.target.value)}
                      className="w-full appearance-none h-11 px-4 pr-10 text-sm bg-background-app border border-border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-text-primary font-medium shadow-sm transition-colors cursor-pointer hover:bg-background-subtle/50"
                    >
                      {dropdown.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-border-divider gap-3 flex flex-col">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-brand text-white text-sm font-bold rounded-xl shadow-sm hover:bg-brand-dark hover:shadow transition-all"
              >
                Apply Filters
              </button>
              {onClear && (
                <button
                  onClick={() => {
                    onClear()
                    setIsOpen(false)
                  }}
                  className="w-full py-3 text-sm font-bold text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-xl transition-all"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
