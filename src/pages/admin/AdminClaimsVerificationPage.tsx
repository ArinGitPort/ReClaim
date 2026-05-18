import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar, CheckCircle2, Clock3, FileSearch, ShieldAlert, User, XCircle, MessageSquare } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { cn } from "@/lib/utils"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { getRealtimeSocket } from "@/lib/realtime"
import { ClaimMessages } from "@/components/ui/ClaimMessagesModal"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Skeleton } from "@/components/ui/Skeleton"
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { useSearchParams } from "react-router-dom"

type ClaimStatus = "PENDING_VERIFICATION" | "INQUIRY_REQUIRED" | "APPROVED" | "DENIED" | "CANCELLED" | "EXPIRED"
type ClaimDecision = "APPROVED" | "DENIED" | "INQUIRY_REQUIRED"

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
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const queryStatus = searchParams.get("status")
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [totalClaims, setTotalClaims] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingDecision, setPendingDecision] = useState<ClaimDecision | null>(null)
  const debouncedSearch = useDebounce(search, 350)
  const debouncedStatus = useDebounce(statusFilter, 350)

  useEffect(() => {
    if (queryStatus === "PENDING_VERIFICATION" || queryStatus === "INQUIRY_REQUIRED") {
      setStatusFilter(queryStatus)
    }
  }, [queryStatus])

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
          status: debouncedStatus || undefined,
          search: debouncedSearch.trim() || undefined,
          page,
          limit: rowsPerPage,
        },
      })

      setClaims(response.data.claims)
      setTotalClaims(response.data.pagination?.total ?? response.data.claims.length)
      setPageCount(response.data.pagination?.pageCount ?? 1)
      setSelectedClaimId((previous) => {
        if (focusCode) {
          const focused = response.data.claims.find((claim) => claim.claimCode.toUpperCase() === focusCode)
          if (focused) {
            return focused.id
          }
        }
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
  }, [debouncedSearch, debouncedStatus, focusCode, page, rowsPerPage])

  useEffect(() => {
    void loadClaims()
  }, [loadClaims])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, rowsPerPage])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) {
      return
    }

    const handleClaimUpdated = () => {
      void loadClaims()
    }

    socket.on("claim.status.updated", handleClaimUpdated)
    return () => {
      socket.off("claim.status.updated", handleClaimUpdated)
    }
  }, [loadClaims])

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

    if (status === "DENIED" && !note.trim()) {
      setError("A reviewer note is required for denial.")
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

  const decisionConfig = useMemo(() => {
    if (!pendingDecision || !selectedClaim) {
      return null
    }

    const subject = selectedClaim.foundItem.title

    switch (pendingDecision) {
      case "APPROVED":
        return {
          title: "Approve Claim",
          message: `Approve claim ${selectedClaim.claimCode} for ${subject}? This will authorize pickup.`,
          confirmText: "Approve",
          isDestructive: false,
        }
      case "DENIED":
        return {
          title: "Deny Claim",
          message: `Deny claim ${selectedClaim.claimCode} for ${subject}? This cannot be undone.`,
          confirmText: "Deny",
          isDestructive: true,
        }
      case "INQUIRY_REQUIRED":
        return {
          title: "Request Inquiry",
          message: `Request more information for claim ${selectedClaim.claimCode}? The claim stays in review.`,
          confirmText: "Request",
          isDestructive: false,
        }
    }
  }, [pendingDecision, selectedClaim])

  const requestDecision = (status: ClaimDecision) => {
    if (status === "DENIED" && !note.trim()) {
      setError("A reviewer note is required for denial.")
      return
    }

    setPendingDecision(status)
  }

  const handleConfirmDecision = async () => {
    if (!pendingDecision) {
      return
    }

    await decide(pendingDecision)
    setPendingDecision(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Claims Verification</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Review incoming gallery claims before any pickup handover is allowed.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="relative group">
              <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search by code, item, or claimant"
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {["", "PENDING_VERIFICATION", "INQUIRY_REQUIRED"].map((status) => (
                <button
                  key={status || "ALL"}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "h-8 px-4 rounded-full border text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all shadow-sm",
                    statusFilter === status
                      ? "bg-brand text-white border-brand shadow-brand/20"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {status ? status.replaceAll("_", " ") : "All"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {isLoading && (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`claims-skeleton-${index}`} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))
            )}
            {!isLoading && filteredClaims.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm font-semibold text-slate-500">No pending claims in queue.</div>}

            {filteredClaims.map((claim) => (
              <button
                key={claim.id}
                type="button"
                onClick={() => setSelectedClaimId(claim.id)}
                className={cn(
                  "w-full text-left bg-white rounded-2xl border p-5 transition-all cursor-pointer group shadow-sm relative overflow-hidden",
                  selectedClaimId === claim.id
                    ? "border-brand ring-2 ring-brand/10 scale-[1.01]"
                    : "border-slate-100 hover:border-brand/20"
                )}
              >
                {selectedClaimId === claim.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand" />}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {claim.claimCode}
                  </span>
                  <StatusPill status={claim.status} />
                </div>
                <h3 className="mt-2 font-bold text-slate-800 text-[15px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {claim.foundItem.title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-1.5">
                  <User className="w-3 h-3 text-slate-300" />
                  {claim.claimantUser.name}
                </div>
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-brand/60 bg-brand/5 -mx-5 -mb-5 px-5 py-2.5 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-brand/10">{claim.foundItem.category}</span>
                </div>
              </button>
            ))}

            <PaginationControls
              page={page}
              pageCount={pageCount}
              total={totalClaims}
              visibleCount={filteredClaims.length}
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

        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-175">
          {!selectedClaim && !isLoading && (
            <div className="p-10 text-center text-sm font-semibold text-slate-500">Select a claim to review.</div>
          )}

          {selectedClaim && (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase underline underline-offset-4 decoration-brand/20 decoration-2">Claim Workspace</h2>
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Reference:</span>
                    <span className="text-brand font-extrabold tracking-tight">{selectedClaim.claimCode}</span>
                  </div>
                </div>
                <StatusPill status={selectedClaim.status} />
              </div>

              <div className="p-8 lg:p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Claimant Profile
                    </h3>
                    <div className="space-y-5">
                      <InfoRow label="Name" value={selectedClaim.claimantUser.name} />
                      <InfoRow label="Student ID" value={selectedClaim.claimantUser.studentId ?? "N/A"} />
                      <InfoRow label="Email" value={selectedClaim.claimantUser.email} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5" /> Claimed Item
                    </h3>
                    <div className="space-y-5">
                      <InfoRow label="Inventory Code" value={selectedClaim.foundItem.code} />
                      <InfoRow label="Title" value={selectedClaim.foundItem.title} />
                      <InfoRow label="Category" value={selectedClaim.foundItem.category} />
                      <InfoRow label="Color" value={selectedClaim.foundItem.color} />
                      <InfoRow label="Found Location" value={selectedClaim.foundItem.foundLocation} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Submitted Proof Details</h3>
                    <div className="rounded-xl border border-brand/10 bg-brand/5 p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {proofEntries(selectedClaim.submittedProof).map((entry) => (
                          <ProofField key={entry.label} label={entry.label} value={entry.value} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
                      <MessageSquare className="w-3.5 h-3.5" /> Dialogue & Chat History
                    </h3>
                    <div className="h-[400px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
                      {isPendingState(selectedClaim.status) ? (
                        <div className="absolute inset-x-0 top-0 h-10 bg-amber-50 border-b border-amber-100 flex items-center px-4 z-10">
                          <span className="text-xs font-bold text-amber-700 flex items-center gap-2">
                            <Clock3 className="w-3.5 h-3.5" /> Ask questions or request more proof from the student here.
                          </span>
                        </div>
                      ) : null}
                      <div className={cn("h-full", isPendingState(selectedClaim.status) ? "pt-10" : "")}>
                        <ClaimMessages claimId={selectedClaim.id} isReadOnly={!isPendingState(selectedClaim.status)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Reviewer Note (Required for Denial)</label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Provide a reason if you are denying this claim..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-200 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-wrap gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || !isPendingState(selectedClaim.status)}
                    onClick={() => requestDecision("INQUIRY_REQUIRED")}
                    className="h-10 border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    <Clock3 className="w-4 h-4 mr-2" /> Request Inquiry
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || !isPendingState(selectedClaim.status)}
                    onClick={() => requestDecision("DENIED")}
                    className="h-10 border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Deny
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting || !isPendingState(selectedClaim.status)}
                    onClick={() => requestDecision("APPROVED")}
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

      <ConfirmModal
        isOpen={Boolean(pendingDecision)}
        onClose={() => !isSubmitting && setPendingDecision(null)}
        onConfirm={() => void handleConfirmDecision()}
        title={decisionConfig?.title ?? ""}
        message={decisionConfig?.message ?? ""}
        confirmText={decisionConfig?.confirmText ?? "Confirm"}
        cancelText="Cancel"
        isDestructive={decisionConfig?.isDestructive ?? false}
        isLoading={isSubmitting}
      />
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
    EXPIRED: "bg-rose-50 text-rose-700 border-rose-200",
  }
  const labels: Record<ClaimStatus, string> = {
    PENDING_VERIFICATION: "Review",
    INQUIRY_REQUIRED: "Waiting for Student",
    APPROVED: "Ready for Pickup",
    DENIED: "Denied",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired Hold",
  }

  return (
    <span className={cn("px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest", styles[status])}>
      {labels[status]}
    </span>
  )
}

function ProofField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/80 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-widest text-brand/70 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-700 wrap-break-word">{value}</div>
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

