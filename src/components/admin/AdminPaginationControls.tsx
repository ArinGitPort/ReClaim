import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { cn } from "@/lib/utils"

type AdminPaginationControlsProps = {
  page: number
  pageCount: number
  total: number
  visibleCount: number
  rowsPerPage: number
  onPageChange: (nextPage: number) => void
  onRowsPerPageChange: (nextRowsPerPage: number) => void
  rowsPerPageOptions?: number[]
  itemLabel?: string
  className?: string
  showRowsPerPage?: boolean
}

export function AdminPaginationControls({
  page,
  pageCount,
  total,
  visibleCount,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  itemLabel = "records",
  className,
  showRowsPerPage = true,
}: AdminPaginationControlsProps) {
  const safePageCount = Math.max(1, pageCount)
  const safePage = Math.min(Math.max(1, page), safePageCount)

  return (
    <div className={cn("pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {showRowsPerPage ? (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
            className="h-8 w-20 border-slate-200 bg-white text-[11px] font-bold"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <div />
      )}

      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">
        Showing {visibleCount} of {total} {itemLabel}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >
          Prev
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{safePage}/{safePageCount}</span>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safePageCount}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

