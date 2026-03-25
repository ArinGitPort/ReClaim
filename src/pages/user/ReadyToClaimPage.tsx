import { useEffect, useMemo, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { ShieldCheck, Ticket, MapPin, CalendarClock } from "lucide-react"
import { api } from "@/lib/api"
import { RecordsFilterBar, RecordsStatusChips } from "@/features/user/RecordsFilterBar"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"

type PickupRow = {
  source: "CLAIM" | "REPORT_MATCH"
  sourceCode: string
  itemTitle: string
  inventoryCode: string
  pickupToken: string
  pickupTokenExpires?: string | null
  officeLocation: string
  createdAt: string
}

const pageWrapperStyles: React.CSSProperties = { 
  width: '100%', 
  minHeight: '100vh', 
  paddingBottom: '6rem' 
}

const mainContainerStyles: React.CSSProperties = { 
  maxWidth: '64rem', 
  margin: '0 auto', 
  padding: '0 1.5rem', 
  marginTop: '2rem' 
}

const headerWrapperStyles: React.CSSProperties = { 
  marginBottom: '2rem' 
}

const pickupCardWrapperStyles: React.CSSProperties = { 
  backgroundColor: '#FFFFFF', 
  borderRadius: '1rem', 
  border: '1px solid #A7F3D0', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  padding: '1.5rem' 
}

const pickupCardContentStyles: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '1.25rem' 
}

const pickupHeaderInfoStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '1.25rem' 
}

const iconWrapperStyles: React.CSSProperties = { 
  width: '3.5rem', 
  height: '3.5rem', 
  backgroundColor: '#ECFDF5', 
  border: '1px solid #D1FAE5', 
  borderRadius: '1rem', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  flexShrink: 0 
}

const badgeBaseStyles: React.CSSProperties = { 
  fontSize: '10px', 
  fontWeight: 'bold', 
  padding: '0.125rem 0.5rem', 
  borderRadius: '0.25rem' 
}

const sourceCodeBadgeStyles: React.CSSProperties = { 
  ...badgeBaseStyles,
  fontFamily: 'monospace', 
  color: '#047857', 
  backgroundColor: '#ECFDF5', 
  border: '1px solid #D1FAE5' 
}

const inventoryCodeBadgeStyles: React.CSSProperties = { 
  ...badgeBaseStyles,
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  color: '#64748B', 
  backgroundColor: '#F8FAFC', 
  border: '1px solid #F1F5F9' 
}

const itemTitleStyles: React.CSSProperties = { 
  fontWeight: 'bold', 
  color: '#0F172A', 
  fontSize: '1.125rem', 
  lineHeight: '1.25', 
  margin: 0 
}

const metaInfoWrapperStyles: React.CSSProperties = { 
  display: 'flex', 
  flexWrap: 'wrap', 
  gap: '1rem', 
  marginTop: '0.5rem', 
  fontSize: '11px', 
  fontWeight: 'bold', 
  color: '#94A3B8' 
}

const metaItemStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.375rem' 
}

const tokenSectionStyles: React.CSSProperties = { 
  marginTop: '1.25rem', 
  paddingTop: '1.25rem', 
  borderRadius: '0.75rem', 
  border: '1px solid #A7F3D0', 
  borderTop: '1px solid #F1F5F9', 
  backgroundColor: '#ECFDF5', 
  padding: '0.75rem 1rem' 
}

const tokenLabelStyles: React.CSSProperties = { 
  fontSize: '10px', 
  fontWeight: 'bold', 
  color: '#047857', 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  marginBottom: '0.5rem' 
}

const tokenValueStyles: React.CSSProperties = { 
  fontSize: '1.25rem', 
  fontWeight: 900, 
  color: '#065F46', 
  letterSpacing: '0.025em', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem' 
}

const emptyStateStyles: React.CSSProperties = { 
  backgroundColor: '#FFFFFF', 
  borderRadius: '1rem', 
  border: '1px solid #E2E8F0', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  padding: '2rem', 
  textAlign: 'center', 
  fontSize: '0.875rem', 
  fontWeight: '600', 
  color: '#64748B' 
}

export function ReadyToClaimPage() {
  const [pickups, setPickups] = useState<PickupRow[]>([])
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => {
    async function fetchPickups(): Promise<void> {
      try {
        const response = await api.get<{ pickups: PickupRow[] }>("/user/pickups")
        setPickups(response.data.pickups || [])
      } catch (err) {
        console.error("[PICKUPS] Failed to load pickups:", err)
        setPickups([])
      }
    }

    void fetchPickups()
  }, [])

  const filteredPickups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return pickups.filter((pickup) => {
      if (sourceFilter && pickup.source !== sourceFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = [pickup.sourceCode, pickup.itemTitle, pickup.inventoryCode, pickup.pickupToken]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [pickups, search, sourceFilter])

  useEffect(() => {
    setPage(1)
  }, [search, sourceFilter, rowsPerPage])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredPickups.length / rowsPerPage)), [filteredPickups.length, rowsPerPage])

  const visiblePickups = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredPickups.slice(start, start + rowsPerPage)
  }, [filteredPickups, page, rowsPerPage])

  const statusOptions = useMemo(
    () => [
      { label: "Manual Claim", value: "CLAIM" },
      { label: "Report Match", value: "REPORT_MATCH" },
    ],
    []
  )

  return (
    <div style={pageWrapperStyles}>
      <TopNavBar title="Ready to Claim" />
      <div style={mainContainerStyles}>
        <div style={headerWrapperStyles}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0F172A', marginBottom: '0.25rem', margin: 0 }}>Ready to Claim</h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>This is the only page where pickup tokens are displayed for physical handover.</p>
        </div>

        <RecordsFilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          statusValue={sourceFilter}
          onStatusChange={(value) => {
            setSourceFilter(value)
            setPage(1)
          }}
          statusOptions={statusOptions}
          searchPlaceholder="Search by source code, item, inventory code, or token"
        />

        <RecordsStatusChips
          statusValue={sourceFilter}
          onStatusChange={setSourceFilter}
          statusOptions={statusOptions}
          resultCount={filteredPickups.length}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visiblePickups.map((pickup) => (
            <div key={`${pickup.source}-${pickup.sourceCode}`} style={pickupCardWrapperStyles}>
              <div style={pickupCardContentStyles}>
                <div style={pickupHeaderInfoStyles}>
                  <div style={iconWrapperStyles}>
                    <ShieldCheck style={{ width: '1.75rem', height: '1.75rem', color: '#059669' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={sourceCodeBadgeStyles}>
                        {pickup.sourceCode}
                      </span>
                      <span style={inventoryCodeBadgeStyles}>
                        {pickup.inventoryCode}
                      </span>
                    </div>
                    <h3 style={itemTitleStyles}>{pickup.itemTitle}</h3>
                    <div style={metaInfoWrapperStyles}>
                      <div style={metaItemStyles}>
                        <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
                        {pickup.officeLocation}
                      </div>
                      <div style={metaItemStyles}>
                        <CalendarClock style={{ width: '0.875rem', height: '0.875rem' }} />
                        {new Date(pickup.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={tokenSectionStyles}>
                  <div style={tokenLabelStyles}>Pickup Token</div>
                  <div style={tokenValueStyles}>
                    <Ticket style={{ width: '1.25rem', height: '1.25rem' }} /> {pickup.pickupToken}
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#047857', margin: 0 }}>
                    Present this token and your ID at the Admin Office.
                    {pickup.pickupTokenExpires ? ` Expires: ${new Date(pickup.pickupTokenExpires).toLocaleString()}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {visiblePickups.length === 0 && (
            <div style={emptyStateStyles}>
              No ready-for-pickup items yet.
            </div>
          )}
        </div>

        <AdminPaginationControls
          page={page}
          pageCount={pageCount}
          total={filteredPickups.length}
          visibleCount={visiblePickups.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(nextRows) => {
            setRowsPerPage(nextRows)
            setPage(1)
          }}
          itemLabel="items"
        />
      </div>
    </div>
  )
}
