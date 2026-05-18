import { CalendarClock, MapPin, RefreshCcw, ShieldCheck, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatShortDate } from "@/lib/formatters"
import type { PickupRow } from "./types"

type ReadyToClaimCardProps = {
  pickup: PickupRow
  now: number
  onReroll: (itemId: string) => void
}

export function ReadyToClaimCard({ pickup, now, onReroll }: ReadyToClaimCardProps) {
  const isExpired = Boolean(pickup.pickupTokenExpires && new Date(pickup.pickupTokenExpires).getTime() < now)

  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
              {pickup.sourceCode}
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
              {formatShortDate(pickup.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-5 pt-5 rounded-xl border px-4 py-3 ${isExpired ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isExpired ? "text-red-700" : "text-emerald-700"}`}>Pickup Token</div>
        <div className={`text-xl font-black tracking-wide flex items-center gap-2 ${isExpired ? "text-red-800" : "text-emerald-800"}`}>
          <Ticket className="w-5 h-5" /> {isExpired ? "EXPIRED" : pickup.pickupToken}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <p className={`text-xs font-semibold ${isExpired ? "text-red-700" : "text-emerald-700"}`}>
            {isExpired ? "Your token has expired. Please regenerate a new one." : "Present this token and your ID at the Admin Office."}
            {pickup.pickupTokenExpires ? ` Expires: ${formatDateTime(pickup.pickupTokenExpires)}` : ""}
          </p>
          {isExpired && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
              onClick={() => onReroll(pickup.itemId)}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
