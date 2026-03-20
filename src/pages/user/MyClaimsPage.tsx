import { useEffect, useMemo, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { Package, Calendar, MapPin, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { RecordsFilterBar, RecordsStatusChips } from "@/features/user/RecordsFilterBar"

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
  pickupToken?: string | null
  pickupTokenExpires?: string | null
}

export function MyClaimsPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const [claims, setClaims] = useState<ClaimView[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null)

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
    }>("/claims")

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
        pickupToken: claim.pickupToken,
        pickupTokenExpires: claim.pickupTokenExpires,
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
      <TopNavBar title="My Claims" />
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

        <RecordsFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          searchPlaceholder="Search by claim code, item, inventory code, category, or location"
          resultCount={filteredClaims.length}
        />

        <RecordsStatusChips
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
        />

        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className={cn(
                "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all",
                claim.id.toUpperCase() === focusCode && "ring-2 ring-brand/40 border-brand bg-brand/[0.03]"
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
                  <ClaimStatusBadge status={claim.status} />
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

                {claim.status === "Ready for Pickup" && claim.pickupToken && (
                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Pickup Authorization</div>
                    <div className="text-lg font-black text-emerald-800 tracking-wide">{claim.pickupToken}</div>
                    <p className="text-xs font-semibold text-emerald-700 mt-1">
                      Present this token and your ID at the Admin Office.
                      {claim.pickupTokenExpires ? ` Expires: ${new Date(claim.pickupTokenExpires).toLocaleString()}` : ""}
                    </p>
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
          {filteredClaims.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
              No claims match your current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClaimStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pending Verification": "bg-amber-50 text-amber-700 border-amber-100",
    "Inquiry Required": "bg-orange-50 text-orange-700 border-orange-100",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Denied": "bg-rose-50 text-rose-700 border-rose-100",
    "Ready for Pickup": "bg-emerald-100 text-emerald-800 border-emerald-200",
  }

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-flex items-center gap-1.5",
      styles[status] ?? "bg-slate-50 text-slate-600 border-slate-100"
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      {status}
    </span>
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
  if (rawStatus === "APPROVED") {
    return "Ready for Pickup"
  }

  return rawStatus.replaceAll("_", " ")
}

function claimStatusMessage(status: string): string {
  if (status === "Ready for Pickup") {
    return "Claim approved. Bring your token and ID to claim the item"
  }

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
