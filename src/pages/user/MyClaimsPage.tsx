import { useEffect, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { Package, Calendar, MapPin, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"

interface ClaimView {
  id: string
  item: string
  category: string
  inventoryId: string
  location: string
  submittedDate: string
  status: string
  reviewerNote?: string | null
  pickupToken?: string | null
  pickupTokenExpires?: string | null
}

export function MyClaimsPage() {
  const [claims, setClaims] = useState<ClaimView[]>([])

  useEffect(() => {
    async function loadClaims(): Promise<void> {
      const response = await api.get<{
        claims: Array<{
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
          id: claim.claimCode,
          item: claim.foundItem.title,
          category: claim.foundItem.category,
          inventoryId: claim.foundItem.code,
          location: claim.foundItem.foundLocation,
          submittedDate: new Date(claim.createdAt).toLocaleDateString(),
          status: formatClaimStatus(claim.status),
          reviewerNote: claim.reviewerNote,
          pickupToken: claim.pickupToken,
          pickupTokenExpires: claim.pickupTokenExpires,
        }))
      )
    }

    void loadClaims()
  }, [])

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

        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Icon */}
                <div className="w-14 h-14 bg-brand/5 border border-brand/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Package className="w-7 h-7 text-brand" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {claim.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {claimStatusMessage(claim.status)}
                  </p>
                </div>
              </div>
              {claim.status === "Inquiry Required" && claim.reviewerNote && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Admin Inquiry</div>
                <p className="text-sm font-semibold text-amber-800">{claim.reviewerNote}</p>
                </div>
              )}
              {claim.status === "Ready for Pickup" && claim.pickupToken && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Pickup Token</div>
                  <div className="text-lg font-black text-emerald-800 tracking-wider">{claim.pickupToken}</div>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    Present this token and your ID at the Admin Office.
                    {claim.pickupTokenExpires ? ` Expires: ${new Date(claim.pickupTokenExpires).toLocaleString()}` : ""}
                  </p>
                </div>
              )}
            </div>
          ))}
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
