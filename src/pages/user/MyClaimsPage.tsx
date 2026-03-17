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
          status: claim.status.replaceAll("_", " "),
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
            <div
              key={claim.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5"
            >
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
                  <Clock className="w-3 h-3" /> Awaiting admin review
                </p>
              </div>
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
    "Action Required": "bg-rose-50 text-rose-700 border-rose-100",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Denied": "bg-slate-50 text-slate-600 border-slate-100",
    "Ready for Pickup": "bg-brand/5 text-brand border-brand/10",
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
