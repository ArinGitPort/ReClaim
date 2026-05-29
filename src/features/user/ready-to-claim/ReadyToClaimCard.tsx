import { useState, useEffect } from "react"
import { CalendarClock, MapPin, RefreshCcw, ShieldCheck, Ticket, QrCode, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { formatDateTime, formatShortDate } from "@/lib/formatters"
import QRCode from "qrcode"
import type { PickupRow } from "./types"

type ReadyToClaimCardProps = {
  pickup: PickupRow
  now: number
  onReroll: (itemId: string) => void
}

export function ReadyToClaimCard({ pickup, now, onReroll }: ReadyToClaimCardProps) {
  const isExpired = Boolean(pickup.pickupTokenExpires && new Date(pickup.pickupTokenExpires).getTime() < now)
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    if (pickup.pickupToken && !isExpired) {
      QRCode.toDataURL(pickup.pickupToken, { width: 256, margin: 2 })
        .then((url) => setQrCodeUrl(url))
        .catch((error) => console.error("Error generating QR Code", error))
    }
  }, [pickup.pickupToken, isExpired])

  return (
    <>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className={`text-xl font-black tracking-wide flex items-center gap-2 ${isExpired ? "text-red-800" : "text-emerald-800"}`}>
              <Ticket className="w-5 h-5" /> {isExpired ? "EXPIRED" : pickup.pickupToken}
            </div>
            {!isExpired && (
              <Button
                size="sm"
                onClick={() => setShowQrModal(true)}
                className="bg-brand hover:bg-brand-active text-white text-xs font-bold rounded-xl h-10 px-4 flex items-center gap-1.5 active:scale-95 shadow-sm uppercase tracking-wider"
              >
                <QrCode className="w-4 h-4" /> View QR Code
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
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

      {showQrModal && (
        <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} className="max-w-md bg-slate-50 rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-brand" /> Pickup Verification
            </h3>
            <button onClick={() => setShowQrModal(false)} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Pickup QR Code" className="w-48 h-48 rounded-lg shadow-sm border border-slate-100" />
            ) : (
              <div className="w-48 h-48 bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-400">
                Generating QR Code...
              </div>
            )}
            <span className="mt-4 font-mono font-black text-slate-800 text-lg uppercase tracking-widest bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-lg select-all">
              {pickup.pickupToken}
            </span>
          </div>
          <p className="mt-6 text-xs font-bold text-slate-500 leading-relaxed">
            Let the office administrator scan this QR code or input the alphanumeric token to verify and release your item.
          </p>
        </Modal>
      )}
    </>
  )
}
