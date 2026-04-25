import { StatusBadge } from "@/components/ui/StatusBadge"
import { useEffect, useMemo, useState } from "react"
import { Package, Calendar, MapPin, ArrowRight, Clock, ShieldCheck, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { UniversalFilterBar } from "@/components/ui/UniversalFilterBar"
import { RecordsStatusChips } from "@/features/user/RecordsStatusChips"
import { SlidersHorizontal } from "lucide-react"
import { PaginationControls } from "@/components/ui/PaginationControls"

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
  pickupToken: string | null
  pickupTokenExpires: string | null
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
    const response = await api.get<{
      claims: Array<{
        id: string
        claimCode: string
        status: string
        createdAt: string
        reviewerNote?: string | null
        pickupToken?: string | null
        pickupTokenExpires?: string | null
        foundItem: {
          code: string
          title: string
          category: string
          foundLocation: string
        }
      }>
    }>("/claims", {
      params: {
        statusIn: "PENDING_VERIFICATION,INQUIRY_REQUIRED,APPROVED,DENIED",
      },
    })

    setClaims(
      response.data.claims.map((claim) => ({
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
        pickupToken: claim.pickupToken ?? null,
        pickupTokenExpires: claim.pickupTokenExpires ?? null,
      }))
    )
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
    <div className="w-full min-h-full pb-24">
<div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Tracking & Status</h2>
            <p className="text-slate-500 text-sm">View the status of items you have claimed from the gallery.</p>
          </div>
          <Link
            to="/gallery"
            className="flex items-center gap-2 text-sm font-bold text-brand hover:underline"
          >
            Browse Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <UniversalFilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search by claim code, item, inventory code, category, or location"
          dropdowns={[
            {
              id: "status",
              icon: <SlidersHorizontal />,
              label: "Status",
              value: statusFilter,
              onChange: (value) => {
                setStatusFilter(value)
                setPage(1)
              },
              options: [
                { value: "", label: "All Statuses" },
                ...statusOptions
              ]
            }
          ]}
          onClear={search || statusFilter ? () => {
            setSearch("")
            setStatusFilter("")
            setPage(1)
          } : undefined}
        />

        <RecordsStatusChips
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          resultCount={filteredClaims.length}
        />

        <div className="space-y-4">
          {visibleClaims.map((claim) => (
            <div
              key={claim.id}
              className={cn(
                "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all",
                claim.id.toUpperCase() === focusCode && "ring-2 ring-brand/40 border-brand bg-brand/3"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Icon */}
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Package className="w-7 h-7 text-slate-400" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {claim.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {claim.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {claim.inventoryId}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{claim.item}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {claim.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted {claim.submittedDate}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <StatusBadge status={claim.status} />
                  <ClaimStatusMessage status={claim.status} />
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <DetailField label="Submitted Date" value={claim.submittedDate} />
                <DetailField label="Category" value={claim.category} />
                <DetailField label="Inventory Code" value={claim.inventoryId} />

                {claim.status === "Inquiry Required" && claim.reviewerNote && (
                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Admin Inquiry</div>
                    <p className="text-sm font-semibold text-amber-800">{claim.reviewerNote}</p>
                  </div>
                )}

                {claim.rawStatus === "APPROVED" && claim.pickupToken && (
                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-emerald-800">Claim Approved — Pickup Token Issued</div>
                        <div className="text-xs font-semibold text-emerald-600 mt-0.5">Present this token and your ID at the Campus Admin Office.</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-200 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xl font-black text-emerald-800 tracking-wide">
                        <Ticket className="w-5 h-5" />
                        {claim.pickupToken}
                      </div>
                      {claim.pickupTokenExpires && (
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                          Expires {new Date(claim.pickupTokenExpires).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isClosableClaimStatus(claim.rawStatus) && (
                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                    <button
                      type="button"
                      disabled={closingTicketId === claim.ticketId}
                      onClick={() => void handleCloseTicket(claim)}
                      className="h-10 px-4 rounded-lg border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {closingTicketId === claim.ticketId ? "Closing..." : "Close Ticket"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {visibleClaims.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
              No claims match your current filters.
            </div>
          )}
        </div>

        <PaginationControls
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

function ClaimStatusMessage({ status }: { status: string }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <Clock className="w-3 h-3" /> {claimStatusMessage(status)}
    </p>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-700">{value}</div>
    </div>
  )
}

function formatClaimStatus(rawStatus: string): string {
  const map: Record<string, string> = {
    PENDING_VERIFICATION: "Pending Verification",
    INQUIRY_REQUIRED: "Inquiry Required",
    APPROVED: "Approved",
    DENIED: "Denied",
    CANCELLED: "Cancelled",
  }
  return map[rawStatus] ?? rawStatus.replaceAll("_", " ")
}

function claimStatusMessage(status: string): string {
  if (status === "Inquiry Required") {
    return "Admin requires additional proof details"
  }

  if (status === "Denied") {
    return "Claim denied by admin review"
  }

  if (status === "Approved") {
    return "Claim approved — present your token at the Admin Office"
  }

  return "Awaiting admin review"
}

function isClosableClaimStatus(status: string): boolean {
  return status === "PENDING_VERIFICATION" || status === "INQUIRY_REQUIRED"
}

