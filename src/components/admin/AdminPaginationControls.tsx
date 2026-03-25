import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"

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
  style?: React.CSSProperties
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
  showRowsPerPage = true,
  style,
}: AdminPaginationControlsProps) {
  const safePageCount = Math.max(1, pageCount)
  const safePage = Math.min(Math.max(1, page), safePageCount)

  return (
    <div style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s ease', ...style }}>
      {showRowsPerPage ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
            style={{ height: '2rem', width: '5rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 700 }}
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

      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>
        Showing {visibleCount} of {total} {itemLabel}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button
          type="button"
          variant="outline"
          style={{ height: '2rem', padding: '0 0.75rem', border: '1px solid #E2E8F0', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', backgroundColor: '#FFFFFF', borderRadius: '0.375rem' }}
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >
          Prev
        </Button>
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>{safePage}/{safePageCount}</span>
        <Button
          type="button"
          variant="outline"
          style={{ height: '2rem', padding: '0 0.75rem', border: '1px solid #E2E8F0', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', backgroundColor: '#FFFFFF', borderRadius: '0.375rem' }}
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safePageCount}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
