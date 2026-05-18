import { Calendar, FileSearch, User } from "lucide-react"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"
import { formatShortDate } from "@/lib/formatters"
import { ClaimStatusPill } from "./claimStatus"
import type { ClaimRow } from "./types"

type ClaimsQueueProps = {
  claims: ClaimRow[]
  isLoading: boolean
  selectedClaimId: string | null
  search: string
  statusFilter: string
  page: number
  pageCount: number
  totalClaims: number
  rowsPerPage: number
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onSelectClaim: (id: string) => void
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}

export function ClaimsQueue({
  claims,
  isLoading,
  selectedClaimId,
  search,
  statusFilter,
  page,
  pageCount,
  totalClaims,
  rowsPerPage,
  onSearchChange,
  onStatusFilterChange,
  onSelectClaim,
  onPageChange,
  onRowsPerPageChange,
}: ClaimsQueueProps) {
  return (
    <div className="xl:col-span-4 space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
        <div className="relative group">
          <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by code, item, or claimant"
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["", "PENDING_VERIFICATION"].map((status) => (
            <button
              key={status || "ALL"}
              type="button"
              onClick={() => onStatusFilterChange(status)}
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
        {isLoading && <ClaimsQueueSkeleton />}
        {!isLoading && claims.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm font-semibold text-slate-500">No pending claims in queue.</div>}

        {claims.map((claim) => (
          <button
            key={claim.id}
            type="button"
            onClick={() => onSelectClaim(claim.id)}
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
              <ClaimStatusPill status={claim.status} />
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
                {formatShortDate(claim.createdAt)}
              </div>
              <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-brand/10">{claim.foundItem.category}</span>
            </div>
          </button>
        ))}

        <PaginationControls
          page={page}
          pageCount={pageCount}
          total={totalClaims}
          visibleCount={claims.length}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          itemLabel="claims"
        />
      </div>
    </div>
  )
}

function ClaimsQueueSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`claims-skeleton-${index}`} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </>
  )
}
