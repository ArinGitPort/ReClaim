import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar, CheckCircle2, Clock3, FileSearch, ShieldAlert, User, XCircle } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"

type ClaimStatus = "PENDING_VERIFICATION" | "INQUIRY_REQUIRED" | "APPROVED" | "DENIED" | "CANCELLED"

type ClaimRow = {
  id: string
  claimCode: string
  status: ClaimStatus
  createdAt: string
  reviewerNote?: string | null
  submittedProof: Record<string, unknown>
  claimantUser: {
    name: string
    studentId?: string | null
    email: string
  }
  foundItem: {
    id: string
    code: string
    title: string
    category: string
    color: string
    foundLocation: string
  }
}

export function ClaimsVerificationPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [totalClaims, setTotalClaims] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [pageCount, setPageCount] = useState(1)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  const loadClaims = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{
        claims: ClaimRow[]
        pagination?: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/claims", {
        params: {
          statusIn: "PENDING_VERIFICATION,INQUIRY_REQUIRED",
          status: statusFilter || undefined,
          search: search.trim() || undefined,
          page,
          limit: rowsPerPage,
        },
      })

      setClaims(response.data.claims)
      setTotalClaims(response.data.pagination?.total ?? response.data.claims.length)
      setPageCount(response.data.pagination?.pageCount ?? 1)
      setSelectedClaimId((previous) => {
        if (previous && response.data.claims.some((claim) => claim.id === previous)) {
          return previous
        }
        return response.data.claims[0]?.id ?? null
      })
    } catch {
      setError("Unable to load claims queue.")
    } finally {
      setIsLoading(false)
    }
  }, [page, rowsPerPage, search, statusFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadClaims()
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [loadClaims])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, rowsPerPage])

  const filteredClaims = useMemo(() => claims, [claims])

  const selectedClaim = useMemo(
    () => filteredClaims.find((claim) => claim.id === selectedClaimId) ?? claims.find((claim) => claim.id === selectedClaimId) ?? null,
    [claims, filteredClaims, selectedClaimId]
  )

  useEffect(() => {
    if (!selectedClaimId && filteredClaims.length > 0) {
      setSelectedClaimId(filteredClaims[0].id)
    }
  }, [filteredClaims, selectedClaimId])

  useEffect(() => {
    if (selectedClaim?.reviewerNote) {
      setNote(selectedClaim.reviewerNote)
    } else {
      setNote("")
    }
  }, [selectedClaim?.id, selectedClaim?.reviewerNote])

  async function decide(status: "APPROVED" | "DENIED" | "INQUIRY_REQUIRED"): Promise<void> {
    if (!selectedClaim) {
      return
    }

    if ((status === "DENIED" || status === "INQUIRY_REQUIRED") && !note.trim()) {
      setError("A reviewer note is required for deny or inquiry.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await api.patch(`/claims/${selectedClaim.id}/decision`, {
        status,
        reviewerNote: note.trim() || undefined,
      })
      await loadClaims()
    } catch {
      setError("Failed to update claim decision.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Claims Verification</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Review incoming gallery claims before any pickup handover is allowed.</p>
      </div>

      {error && (
        <div style={{ borderRadius: '0.75rem', border: '1px solid #FECACA', backgroundColor: '#FEF2F2', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#B91C1C' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 24rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ClaimsQueueList
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
            isLoading={isLoading}
            filteredClaims={filteredClaims}
            selectedClaimId={selectedClaimId}
            onSelectClaim={setSelectedClaimId}
            page={page}
            pageCount={pageCount}
            totalClaims={totalClaims}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(1); }}
          />
        </div>

        <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', minHeight: '44rem' }}>
          <ClaimWorkspace
            selectedClaim={selectedClaim}
            isLoading={isLoading}
            note={note}
            onNoteChange={setNote}
            isSubmitting={isSubmitting}
            onDecide={decide}
          />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{value}</div>
    </div>
  )
}

function ClaimsQueueList({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  filteredClaims,
  selectedClaimId,
  onSelectClaim,
  page,
  pageCount,
  totalClaims,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  search: string
  onSearchChange: (val: string) => void
  statusFilter: string
  onStatusFilterChange: (val: string) => void
  isLoading: boolean
  filteredClaims: ClaimRow[]
  selectedClaimId: string | null
  onSelectClaim: (id: string) => void
  page: number
  pageCount: number
  totalClaims: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}) {
  return (
    <>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E2E8F0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ position: 'relative' }}>
          <FileSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by code, item, or claimant"
            style={{ width: '100%', height: '2.75rem', paddingLeft: '2.75rem', paddingRight: '1rem', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {["", "PENDING_VERIFICATION", "INQUIRY_REQUIRED"].map((status) => (
            <button
              key={status || "ALL"}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              style={{
                height: '2rem',
                padding: '0 1rem',
                borderRadius: '9999px',
                border: '1px solid',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                backgroundColor: statusFilter === status ? '#1E2F85' : '#FFFFFF',
                color: statusFilter === status ? '#FFFFFF' : '#64748B',
                borderColor: statusFilter === status ? '#1E2F85' : '#E2E8F0',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              {status ? status.replaceAll("_", " ") : "All"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading && <div style={{ backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E2E8F0', padding: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Loading claims...</div>}
        {!isLoading && filteredClaims.length === 0 && <div style={{ backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E2E8F0', padding: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>No pending claims in queue.</div>}

        {filteredClaims.map((claim) => (
          <button
            key={claim.id}
            type="button"
            onClick={() => onSelectClaim(claim.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              border: '1px solid',
              borderColor: selectedClaimId === claim.id ? '#1E2F85' : '#F1F5F9',
              padding: '1.25rem',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: selectedClaimId === claim.id ? '0 0 0 2px rgba(30, 47, 133, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transform: selectedClaimId === claim.id ? 'scale(1.01)' : 'none'
            }}
          >
            {selectedClaimId === claim.id && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.375rem', backgroundColor: '#1E2F85' }} />}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', fontFamily: 'monospace', letterSpacing: '-0.025em', backgroundColor: '#F8FAFC', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #F1F5F9' }}>
                {claim.claimCode}
              </span>
              <StatusPill status={claim.status} />
            </div>
            <h3 style={{ marginTop: '0.5rem', fontWeight: 700, color: '#1E293B', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0.5rem 0 0 0' }}>
              {claim.foundItem.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginTop: '0.375rem' }}>
              <User style={{ width: '0.75rem', height: '0.75rem', color: '#CBD5E1' }} />
              {claim.claimantUser.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(30, 47, 133, 0.6)', backgroundColor: 'rgba(30, 47, 133, 0.05)', margin: '1rem -1.25rem -1.25rem', padding: '0.625rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar style={{ width: '0.75rem', height: '0.75rem' }} />
                {new Date(claim.createdAt).toLocaleDateString()}
              </div>
              <span style={{ backgroundColor: '#FFFFFF', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid rgba(30, 47, 133, 0.1)' }}>{claim.foundItem.category}</span>
            </div>
          </button>
        ))}

        <AdminPaginationControls
          page={page}
          pageCount={pageCount}
          total={totalClaims}
          visibleCount={filteredClaims.length}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          itemLabel="claims"
        />
      </div>
    </>
  )
}

function ClaimWorkspace({
  selectedClaim,
  isLoading,
  note,
  onNoteChange,
  isSubmitting,
  onDecide,
}: {
  selectedClaim: ClaimRow | null
  isLoading: boolean
  note: string
  onNoteChange: (val: string) => void
  isSubmitting: boolean
  onDecide: (status: "APPROVED" | "DENIED" | "INQUIRY_REQUIRED") => Promise<void>
}) {
  if (!selectedClaim && !isLoading) {
    return <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Select a claim to review.</div>
  }

  if (!selectedClaim) return null

  return (
    <>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', backgroundColor: 'rgba(248, 250, 252, 0.5)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#1E2F85', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', textTransform: 'uppercase', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(30, 47, 133, 0.2)', textDecorationThickness: '2px', margin: 0 }}>Claim Workspace</h2>
            <span style={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Reference:</span>
            <span style={{ color: '#1E2F85', fontWeight: 800, letterSpacing: '-0.025em' }}>{selectedClaim.claimCode}</span>
          </div>
        </div>
        <StatusPill status={selectedClaim.status} />
      </div>

      <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <User style={{ width: '0.875rem', height: '0.875rem' }} /> Claimant Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <InfoRow label="Name" value={selectedClaim.claimantUser.name} />
              <InfoRow label="Student ID" value={selectedClaim.claimantUser.studentId ?? "N/A"} />
              <InfoRow label="Email" value={selectedClaim.claimantUser.email} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ShieldAlert style={{ width: '0.875rem', height: '0.875rem' }} /> Claimed Item
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <InfoRow label="Inventory Code" value={selectedClaim.foundItem.code} />
              <InfoRow label="Title" value={selectedClaim.foundItem.title} />
              <InfoRow label="Category" value={selectedClaim.foundItem.category} />
              <InfoRow label="Color" value={selectedClaim.foundItem.color} />
              <InfoRow label="Found Location" value={selectedClaim.foundItem.foundLocation} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', margin: 0 }}>Submitted Proof Details</h3>
          <div style={{ borderRadius: '0.75rem', border: '1px solid rgba(30, 47, 133, 0.1)', backgroundColor: 'rgba(30, 47, 133, 0.05)', padding: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {proofEntries(selectedClaim.submittedProof).map((entry) => (
                <ProofField key={entry.label} label={entry.label} value={entry.value} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>Reviewer Note</label>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Required for deny or inquiry"
            rows={4}
            style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid #E2E8F0', padding: '0.75rem 1rem', fontSize: '0.875rem', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || !isPendingState(selectedClaim.status)}
            onClick={() => void onDecide("INQUIRY_REQUIRED")}
            style={{ height: '2.5rem', padding: '0 1rem', border: '1px solid #FDE68A', color: '#B45309', backgroundColor: '#FFFFFF', fontWeight: 700, borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Clock3 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Request Inquiry
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || !isPendingState(selectedClaim.status)}
            onClick={() => void onDecide("DENIED")}
            style={{ height: '2.5rem', padding: '0 1rem', border: '1px solid #FECACA', color: '#B91C1C', backgroundColor: '#FFFFFF', fontWeight: 700, borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <XCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Deny
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !isPendingState(selectedClaim.status)}
            onClick={() => void onDecide("APPROVED")}
            style={{ height: '2.5rem', padding: '0 1.5rem', backgroundColor: '#059669', color: '#FFFFFF', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          >
            <CheckCircle2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Approve
          </Button>
        </div>
      </div>
    </>
  )
}


function StatusPill({ status }: { status: ClaimStatus }) {
  const styles: Record<ClaimStatus, { bg: string, text: string, border: string }> = {
    PENDING_VERIFICATION: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
    INQUIRY_REQUIRED: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
    APPROVED: { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' },
    DENIED: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
    CANCELLED: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
  }

  const current = styles[status]

  return (
    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid', borderColor: current.border, backgroundColor: current.bg, color: current.text, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {status.replaceAll("_", " ")}
    </span>
  )
}

function ProofField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.7)', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '0.5rem 0.75rem' }}>
      <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(30, 47, 133, 0.7)', marginBottom: '0.125rem' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', wordBreak: 'break-word' }}>{value}</div>
    </div>
  )
}

function proofEntries(proof: Record<string, unknown>): Array<{ label: string; value: string }> {
  const entries = Object.entries(proof)
  if (entries.length === 0) {
    return [{ label: "Details", value: "No proof fields were submitted." }]
  }

  return entries.map(([key, value]) => ({
    label: prettifyProofKey(key),
    value: stringifyProofValue(value),
  }))
}

function stringifyProofValue(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyProofValue(item)).join(", ")
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([nestedKey, nestedValue]) => `${prettifyProofKey(nestedKey)}: ${stringifyProofValue(nestedValue)}`)
      .join(" | ")
  }

  return "Not provided"
}

function prettifyProofKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function isPendingState(status: ClaimStatus): boolean {
  return status === "PENDING_VERIFICATION" || status === "INQUIRY_REQUIRED"
}
