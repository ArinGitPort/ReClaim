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
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  statusValue: string
  onStatusChange: (value: string) => void
  statusOptions: Option[]
  searchPlaceholder: string
}) {
  const canReset = searchValue.length > 0 || statusValue.length > 0

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              style={{ paddingLeft: '2.5rem', height: '2.75rem', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
            />
          </div>

          <div style={{ position: 'relative', width: '224px' }}>
            <SlidersHorizontal style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8', pointerEvents: 'none', zIndex: 1 }} />
            <Select
              value={statusValue}
              onChange={(event) => onStatusChange(event.target.value)}
              style={{ paddingLeft: '2.5rem', height: '2.75rem', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
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
            style={{ height: '2.75rem', padding: '0 1rem', borderColor: '#E2E8F0', color: '#475569' }}
          >
            <X style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RecordsStatusChips({
  statusValue,
  onStatusChange,
  statusOptions,
  resultCount,
  style,
}: {
  statusValue: string
  onStatusChange: (value: string) => void
  statusOptions: Option[]
  resultCount: number
  style?: React.CSSProperties
}) {
  const quickStatusOptions = statusOptions.slice(0, 5)

  const chipBaseStyles: React.CSSProperties = {
    height: '2rem',
    padding: '0 0.75rem',
    borderRadius: '9999px',
    border: '1px solid #E2E8F0',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    transition: 'all 0.2s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const activeChipStyles: React.CSSProperties = {
    backgroundColor: '#1E2F85',
    color: '#FFFFFF',
    borderColor: '#1E2F85',
  }

  const inactiveChipStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    color: '#64748B',
  }

  return (
    <div style={{ marginBottom: '1.5rem', ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 'max-content' }}>
            <button
              type="button"
              onClick={() => onStatusChange("")}
              style={{
                ...chipBaseStyles,
                ...(statusValue === "" ? activeChipStyles : inactiveChipStyles)
              }}
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
                  style={{
                    ...chipBaseStyles,
                    ...(isActive ? activeChipStyles : inactiveChipStyles)
                  }}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', margin: 0 }}>
          Showing {resultCount} result{resultCount === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  )
}

