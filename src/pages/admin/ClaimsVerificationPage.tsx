import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock3, Search, ShieldAlert, User, XCircle } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

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
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function loadClaims(): Promise<void> {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{ claims: ClaimRow[] }>("/claims", {
        params: {
          statusIn: "PENDING_VERIFICATION,INQUIRY_REQUIRED",
        },
      })

      setClaims(response.data.claims)
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

      const haystack = [
        claim.claimCode,
        claim.foundItem.title,
        claim.foundItem.code,
        claim.claimantUser.name,
        claim.claimantUser.studentId ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [claims, search, statusFilter])

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Claims Verification</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Review incoming gallery claims before any pickup handover is allowed.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by code, item, or claimant"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {["", "PENDING_VERIFICATION", "INQUIRY_REQUIRED"].map((status) => (
                <button
                  key={status || "ALL"}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "h-8 px-3 rounded-full border text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                    statusFilter === status ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  {status ? status.replaceAll("_", " ") : "All"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {isLoading && <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm font-semibold text-slate-500">Loading claims...</div>}
            {!isLoading && filteredClaims.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm font-semibold text-slate-500">No pending claims in queue.</div>}

            {filteredClaims.map((claim) => (
              <button
                key={claim.id}
                type="button"
                onClick={() => setSelectedClaimId(claim.id)}
                className={cn(
                  "w-full text-left bg-white rounded-xl border p-4 transition-all",
                  selectedClaimId === claim.id ? "border-brand ring-2 ring-brand/10" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{claim.claimCode}</span>
                  <StatusPill status={claim.status} />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 truncate">{claim.foundItem.title}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{claim.claimantUser.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {!selectedClaim && !isLoading && (
            <div className="p-10 text-center text-sm font-semibold text-slate-500">Select a claim to review.</div>
          )}

          {selectedClaim && (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Claim Reference</div>
                  <div className="text-lg font-black text-slate-900">{selectedClaim.claimCode}</div>
                </div>
                <StatusPill status={selectedClaim.status} />
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Claimant
                  </h3>
                  <InfoRow label="Name" value={selectedClaim.claimantUser.name} />
                  <InfoRow label="Student ID" value={selectedClaim.claimantUser.studentId ?? "N/A"} />
                  <InfoRow label="Email" value={selectedClaim.claimantUser.email} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> Item
                  </h3>
                  <InfoRow label="Inventory Code" value={selectedClaim.foundItem.code} />
                  <InfoRow label="Title" value={selectedClaim.foundItem.title} />
                  <InfoRow label="Category" value={selectedClaim.foundItem.category} />
                  <InfoRow label="Color" value={selectedClaim.foundItem.color} />
                  <InfoRow label="Found Location" value={selectedClaim.foundItem.foundLocation} />
                </div>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Submitted Proof</h3>
                <pre className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 overflow-x-auto">
{JSON.stringify(selectedClaim.submittedProof, null, 2)}
                </pre>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Reviewer Note</label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Required for deny or inquiry"
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || !isPendingState(selectedClaim.status)}
                    onClick={() => void decide("INQUIRY_REQUIRED")}
                    className="h-10 border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    <Clock3 className="w-4 h-4 mr-2" /> Request Inquiry
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || !isPendingState(selectedClaim.status)}
                    onClick={() => void decide("DENIED")}
                    className="h-10 border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Deny
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting || !isPendingState(selectedClaim.status)}
                    onClick={() => void decide("APPROVED")}
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  )
}

function StatusPill({ status }: { status: ClaimStatus }) {
  const styles: Record<ClaimStatus, string> = {
    PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
    INQUIRY_REQUIRED: "bg-orange-50 text-orange-700 border-orange-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DENIED: "bg-rose-50 text-rose-700 border-rose-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-300",
  }

  return (
    <span className={cn("px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest", styles[status])}>
      {status.replaceAll("_", " ")}
    </span>
  )
}

function isPendingState(status: ClaimStatus): boolean {
  return status === "PENDING_VERIFICATION" || status === "INQUIRY_REQUIRED"
}
