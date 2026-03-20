import { useEffect, useMemo, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { ShieldCheck, Ticket, MapPin, CalendarClock } from "lucide-react"
import { api } from "@/lib/api"
import { RecordsFilterBar, RecordsStatusChips } from "@/features/user/RecordsFilterBar"

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

export function ReadyToClaimPage() {
  const [pickups, setPickups] = useState<PickupRow[]>([])
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")

  useEffect(() => {
    async function loadPickups(): Promise<void> {
      const response = await api.get<{ pickups: PickupRow[] }>("/user/pickups")
      setPickups(response.data.pickups)
    }

    void loadPickups()
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

  const statusOptions = useMemo(
    () => [
      { label: "Manual Claim", value: "CLAIM" },
      { label: "Report Match", value: "REPORT_MATCH" },
    ],
    []
  )

  return (
    <div className="w-full min-h-full pb-24">
      <TopNavBar title="Ready to Claim" />
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Token Wallet</h2>
          <p className="text-slate-500 text-sm">This is the only page where pickup tokens are displayed for physical handover.</p>
        </div>

        <RecordsFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          statusValue={sourceFilter}
          onStatusChange={setSourceFilter}
          statusOptions={statusOptions}
          searchPlaceholder="Search by source code, item, inventory code, or token"
          resultCount={filteredPickups.length}
        />

        <RecordsStatusChips
          statusValue={sourceFilter}
          onStatusChange={setSourceFilter}
          statusOptions={statusOptions}
        />

        <div className="space-y-4">
          {filteredPickups.map((pickup) => (
            <div key={`${pickup.source}-${pickup.sourceCode}`} className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      {pickup.sourceCode}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {pickup.inventoryCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{pickup.itemTitle}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {pickup.officeLocation}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {new Date(pickup.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2">Pickup Token</div>
                <div className="text-xl font-black text-emerald-800 tracking-wide flex items-center gap-2">
                  <Ticket className="w-5 h-5" /> {pickup.pickupToken}
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  Present this token and your ID at the Admin Office.
                  {pickup.pickupTokenExpires ? ` Expires: ${new Date(pickup.pickupTokenExpires).toLocaleString()}` : ""}
                </p>
              </div>
            </div>
          ))}

          {filteredPickups.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
              No ready-for-pickup items yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
