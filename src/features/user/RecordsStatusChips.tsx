import { cn } from "@/lib/utils"

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
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => onStatusChange("")}
              className={[
                "h-8 px-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-colors",
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
                  onClick={() => onStatusChange(isActive ? "" : option.value)}
                  className={[
                    "h-8 px-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap",
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
