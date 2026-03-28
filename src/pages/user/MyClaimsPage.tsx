import { useEffect, useMemo, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { Package, Calendar, MapPin, ArrowRight, Clock } from "lucide-react"
import { DataRow } from "@/components/ui/DataRow"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { RecordsFilterBar, RecordsStatusChips } from "@/features/user/RecordsFilterBar"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"

interface ClaimView {
  ticketId: string
  id: string
  item: string
  category: string
  inventoryId: string
  location: string
  submittedDate: string
  rawStatus: string
  status: string
  reviewerNote?: string | null
}

export function MyClaimsPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const [claims, setClaims] = useState<ClaimView[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  async function loadClaims(): Promise<void> {
    try {
      const response = await api.get<{
        claims: Array<{
          id: string
          claimCode: string
          status: string
          createdAt: string
          reviewerNote?: string | null
          foundItem: {
            code: string
            title: string
            category: string
            foundLocation: string
          }
        }>
      }>("/claims", {
        params: {
          statusIn: "PENDING_VERIFICATION,INQUIRY_REQUIRED,DENIED",
        },
      })

      const claimsData = response.data.claims || []
      setClaims(
        claimsData.map((claim) => ({
          ticketId: claim.id,
          id: claim.claimCode,
          item: claim.foundItem.title,
          category: claim.foundItem.category,
          inventoryId: claim.foundItem.code,
          location: claim.foundItem.foundLocation,
          submittedDate: new Date(claim.createdAt).toLocaleDateString(),
          rawStatus: claim.status,
          status: formatClaimStatus(claim.status),
          reviewerNote: claim.reviewerNote,
        }))
      )
    } catch (err) {
      console.error("[CLAIMS] Failed to load claims:", err)
      setClaims([])
    }
  }

  useEffect(() => {
    void loadClaims()
  }, [])

  const filteredClaims = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return claims.filter((claim) => {
      if (statusFilter && claim.status !== statusFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = [claim.id, claim.item, claim.category, claim.inventoryId, claim.location]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [claims, search, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, rowsPerPage])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredClaims.length / rowsPerPage)), [filteredClaims.length, rowsPerPage])

  const visibleClaims = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredClaims.slice(start, start + rowsPerPage)
  }, [filteredClaims, page, rowsPerPage])

  async function handleCloseTicket(claim: ClaimView): Promise<void> {
    if (!isClosableClaimStatus(claim.rawStatus)) {
      return
    }

    setClosingTicketId(claim.ticketId)
    try {
      await api.patch(`/claims/${claim.ticketId}/close`)
      await loadClaims()
    } finally {
      setClosingTicketId(null)
    }
  }

  const statusOptions = useMemo(() => {
    return Array.from(new Set(claims.map((claim) => claim.status))).map((status) => ({
      label: status,
      value: status,
    }))
  }, [claims])

  return (
    <div style={{ width: '100%', minHeight: '100%', paddingBottom: '6rem' }}>
      <TopNavBar title="My Claims" />
      <div style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto', padding: '0 1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Claim History</h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Track the verification and pickup status of your claimed items.</p>
          </div>
          <Link
            to="/gallery"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#1E2F85', textDecoration: 'none' }}
          >
            Browse Gallery <ArrowRight style={{ width: '1rem', height: '1rem' }} />
          </Link>
        </div>

        <RecordsFilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          statusValue={statusFilter}
          onStatusChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
          statusOptions={statusOptions}
          searchPlaceholder="Search by claim code, item, inventory code, category, or location"
        />

        <RecordsStatusChips
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          resultCount={filteredClaims.length}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibleClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              isFocused={claim.id.toUpperCase() === focusCode}
              isClosing={closingTicketId === claim.ticketId}
              onCloseTicket={() => void handleCloseTicket(claim)}
            />
          ))}
          {visibleClaims.length === 0 && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '2rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748B' }}>
              No claims match your current filters.
            </div>
          )}
        </div>

        <AdminPaginationControls
          page={page}
          pageCount={pageCount}
          total={filteredClaims.length}
          visibleCount={visibleClaims.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(nextRows) => {
            setRowsPerPage(nextRows)
            setPage(1)
          }}
          itemLabel="claims"
        />
      </div>
    </div>
  )
}

function ClaimCard({
  claim,
  isFocused,
  isClosing,
  onCloseTicket
}: {
  claim: ClaimView
  isFocused: boolean
  isClosing: boolean
  onCloseTicket: () => void
}) {
  return (
    <div style={{
      backgroundColor: isFocused ? 'rgba(30, 47, 133, 0.03)' : '#FFFFFF',
      borderRadius: '1rem',
      border: isFocused ? '1px solid #1E2F85' : '1px solid #E2E8F0',
      boxShadow: isFocused ? '0 0 0 2px rgba(30, 47, 133, 0.4)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem' }}>
          {/* Icon */}
          <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package style={{ width: '1.75rem', height: '1.75rem', color: '#94A3B8' }} />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace' }}>
                {claim.id}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>
                {claim.category}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>
                {claim.inventoryId}
              </span>
            </div>
            <h3 style={{ fontWeight: 'bold', color: '#0F172A', fontSize: '1.125rem', lineHeight: '1.25', margin: 0 }}>{claim.item}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '11px', fontWeight: 'bold', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
                {claim.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                Submitted {claim.submittedDate}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flexShrink: 0 }}>
            <ClaimStatusBadge status={claim.status} />
            <ClaimStatusMessage status={claim.status} />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
          <DataRow label="Submitted Date" value={claim.submittedDate} />
          <DataRow label="Category" value={claim.category} />
          <DataRow label="Inventory Code" value={claim.inventoryId} />

          {claim.status === "Inquiry Required" && claim.reviewerNote && (
            <div style={{ gridColumn: 'span 3', borderRadius: '0.75rem', border: '1px solid #FDE68A', backgroundColor: '#FFFBEB', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Admin Inquiry</div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400E', margin: 0 }}>{claim.reviewerNote}</p>
            </div>
          )}

          {isClosableClaimStatus(claim.rawStatus) && (
            <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={isClosing}
                onClick={onCloseTicket}
                style={{ 
                  height: '2.5rem', 
                  padding: '0 1rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #FECACA', 
                  backgroundColor: '#FEE2E2', 
                  color: '#B91C1C', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  cursor: 'pointer',
                  opacity: isClosing ? 0.5 : 1
                }}
              >
                {isClosing ? "Closing..." : "Close Ticket"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClaimStatusBadge({ status }: { status: string }) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending Verification": return { backgroundColor: '#FFFBEB', color: '#D97706', borderColor: '#FEF3C7' }
      case "Inquiry Required": return { backgroundColor: '#FFF7ED', color: '#EA580C', borderColor: '#FFEDD5' }
      case "Approved": return { backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#D1FAE5' }
      case "Denied": return { backgroundColor: '#FFF1F2', color: '#E11D48', borderColor: '#FFE4E6' }
      case "Ready for Pickup": return { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' }
      default: return { backgroundColor: '#F8FAFC', color: '#64748B', borderColor: '#F1F5F9' }
    }
  }

  const currentStyle = getStatusStyles(status)

  return (
    <span style={{ padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', ...currentStyle }}>
      <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', backgroundColor: 'currentColor', opacity: 0.7 }} />
      {status}
    </span>
  )
}

function ClaimStatusMessage({ status }: { status: string }) {
  return (
    <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
      <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> {claimStatusMessage(status)}
    </p>
  )
}

function formatClaimStatus(rawStatus: string): string {
  return rawStatus.replaceAll("_", " ")
}

function claimStatusMessage(status: string): string {
  if (status === "Inquiry Required") {
    return "Admin requires additional proof details"
  }

  if (status === "Denied") {
    return "Claim denied by admin review"
  }

  return "Awaiting admin review"
}

function isClosableClaimStatus(status: string): boolean {
  return status === "PENDING_VERIFICATION" || status === "INQUIRY_REQUIRED"
}
