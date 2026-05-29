import { cn } from "@/lib/utils"
import { useRef, useState } from "react"

type Option = {
  label: string
  value: string
}

export function RecordsStatusChips({
  statusValue,
  onStatusChange,
  statusOptions,
  resultCount,
  className,
}: {
  statusValue: string
  onStatusChange: (value: string) => void
  statusOptions: Option[]
  resultCount: number
  className?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          )}
        >
          <div className="flex items-center gap-2 min-w-max pointer-events-none">
            <button
              type="button"
              onClick={() => !isDragging && onStatusChange("")}
              className={[
                "h-8 px-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-colors pointer-events-auto",
                statusValue === "" ? "bg-brand text-white border-brand" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              All
            </button>
            {statusOptions.map((option) => {
              const isActive = statusValue === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !isDragging && onStatusChange(isActive ? "" : option.value)}
                  className={[
                    "h-8 px-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap pointer-events-auto",
                    isActive ? "bg-brand text-white border-brand" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
          Showing {resultCount} result{resultCount === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  )
}
