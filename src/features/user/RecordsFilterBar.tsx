import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"

type Option = {
  label: string
  value: string
}

export function RecordsFilterBar({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
  searchPlaceholder,
  resultCount,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  statusValue: string
  onStatusChange: (value: string) => void
  statusOptions: Option[]
  searchPlaceholder: string
  resultCount: number
}) {
  const canReset = searchValue.length > 0 || statusValue.length > 0

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 h-11 bg-slate-50 border-slate-200"
          />
        </div>

        <div className="relative w-full lg:w-56">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Select
            value={statusValue}
            onChange={(event) => onStatusChange(event.target.value)}
            className="pl-10 h-11 bg-slate-50 border-slate-200"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onSearchChange("")
            onStatusChange("")
          }}
          disabled={!canReset}
          className="h-11 px-4 border-slate-200 text-slate-600"
        >
          <X className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Showing {resultCount} result{resultCount === 1 ? "" : "s"}
      </p>
    </div>
  )
}

export function RecordsStatusChips({
  statusValue,
  onStatusChange,
  statusOptions,
}: {
  statusValue: string
  onStatusChange: (value: string) => void
  statusOptions: Option[]
}) {
  const quickStatusOptions = statusOptions.slice(0, 5)

  return (
    <div className="mb-6 overflow-x-auto pb-1">
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
        {quickStatusOptions.map((option) => {
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
  )
}
