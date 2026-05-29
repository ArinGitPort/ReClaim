import { Calendar, Clock, Loader2, MapPin, MessageSquare, Package, RefreshCw, ShieldCheck, Ticket, QrCode, X } from "lucide-react"
import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { Modal } from "@/components/ui/Modal"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ClaimMessages } from "@/components/ui/ClaimMessagesModal"
import { cn } from "@/lib/utils"
import { claimStatusMessage, formatTimeRemaining, isClosableClaimStatus } from "./claimStatus"
import type { ClaimView } from "./types"

type MyClaimCardProps = {
  claim: ClaimView
  now: number
  focusCode: string
  closingTicketId: string | null
  rerollingItemId: string | null
  onPreviewImage: (url: string) => void
  onOpenChat: (ticketId: string) => void
  onCloseTicket: (claim: ClaimView) => void
  onRerollToken: (itemId: string) => void
  onMessageSent: () => void
  hasUnreadMessage: boolean
}

export function MyClaimCard({
  claim,
  now,
  focusCode,
  closingTicketId,
  rerollingItemId,
  onPreviewImage,
  onOpenChat,
  onCloseTicket,
  onRerollToken,
  onMessageSent,
  hasUnreadMessage,
}: MyClaimCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all",
        claim.id.toUpperCase() === focusCode && "ring-2 ring-brand/40 border-brand bg-brand/3"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {claim.imageUrl ? (
          <button
            type="button"
            onClick={() => onPreviewImage(claim.imageUrl!)}
            className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shrink-0 hover:ring-2 hover:ring-brand/50 transition-all focus:outline-none"
          >
            <img src={claim.imageUrl} alt={claim.item} className="w-full h-full object-cover" />
          </button>
        ) : (
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
            <Package className="w-7 h-7 text-slate-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{claim.id}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
              {claim.category}
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

        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <StatusBadge status={claim.status} />
          <ClaimStatusMessage claim={claim} now={now} />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onOpenChat(claim.ticketId)
            }}
            className={cn(
              "mt-1 flex items-center gap-1.5 text-xs font-bold transition-colors px-2.5 py-1.5 rounded-lg border relative",
              hasUnreadMessage
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "text-brand hover:text-brand/80 bg-brand/5 border-brand/10"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {hasUnreadMessage ? "New Message" : "Messages"}
            {hasUnreadMessage && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />}
          </button>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <DetailField label="Submitted Date" value={claim.submittedDate} />
        <DetailField label="Category" value={claim.category} />
        {claim.status === "Inquiry Required" && <InquiryPanel claim={claim} onMessageSent={onMessageSent} />}
        {(claim.rawStatus === "PENDING_VERIFICATION" || claim.rawStatus === "INQUIRY_REQUIRED") && claim.reservationExpiresAt && (
          <ReservationPanel claim={claim} now={now} />
        )}
        {claim.rawStatus === "APPROVED" && claim.pickupToken && (
          <PickupTokenPanel claim={claim} now={now} rerollingItemId={rerollingItemId} onRerollToken={onRerollToken} />
        )}
        {isClosableClaimStatus(claim.rawStatus) && (
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="button"
              disabled={closingTicketId === claim.ticketId}
              onClick={() => onCloseTicket(claim)}
              className="h-10 px-4 rounded-lg border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {closingTicketId === claim.ticketId ? "Closing..." : "Close Ticket"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ClaimStatusMessage({ claim, now }: { claim: ClaimView; now: number }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <Clock className="w-3 h-3" /> {claimStatusMessage(claim, now)}
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

function InquiryPanel({ claim, onMessageSent }: { claim: ClaimView; onMessageSent: () => void }) {
  return (
    <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-amber-200 bg-amber-50 px-0 py-0 space-y-3 overflow-hidden flex flex-col items-stretch">
      <div className="p-4 bg-amber-100 border-b border-amber-200">
        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1 flex items-center justify-between">
          Admin Dialogue / History
          <span className="font-semibold capitalize text-amber-900 bg-amber-200/50 px-2 py-0.5 rounded text-[10px] border border-amber-300">Action Required</span>
        </div>
        <p className="text-sm font-semibold text-amber-900">Please provide the requested details using the Messages feature.</p>
      </div>
      <div className="flex-1 bg-white border-t border-amber-200 mt-2 min-h-[300px] h-[350px]">
        <ClaimMessages claimId={claim.ticketId} onMessageSent={onMessageSent} />
      </div>
    </div>
  )
}

function ReservationPanel({ claim, now }: { claim: ClaimView; now: number }) {
  if (!claim.reservationExpiresAt) return null

  return (
    <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-brand/20 bg-brand/5 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-brand/20 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-brand" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">Item Reserved During Review</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">
            Hold expires in {formatTimeRemaining(claim.reservationExpiresAt, now)}. If it expires or you close the ticket, you can claim this item again after 24 hours.
          </div>
        </div>
      </div>
    </div>
  )
}

function PickupTokenPanel({
  claim,
  now,
  rerollingItemId,
  onRerollToken,
}: {
  claim: ClaimView
  now: number
  rerollingItemId: string | null
  onRerollToken: (itemId: string) => void
}) {
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  const isExpired = claim.pickupTokenExpires
    ? new Date(claim.pickupTokenExpires).getTime() < now
    : false

  useEffect(() => {
    if (claim.pickupToken && !isExpired) {
      QRCode.toDataURL(claim.pickupToken, { width: 256, margin: 2 })
        .then((url) => setQrCodeUrl(url))
        .catch((error) => console.error("Error generating QR Code", error))
    }
  }, [claim.pickupToken, isExpired])

  if (!claim.pickupToken) return null

  return (
    <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
      {claim.itemStatus === "RETURNED" ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-800">Handover Completed</div>
            <div className="text-xs font-semibold text-emerald-600 mt-0.5">You have successfully picked up this item.</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-800">Claim Approved - Pickup Token Issued</div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5">Present this token and your ID at the Campus Admin Office.</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xl font-black text-emerald-800 tracking-wide">
                <Ticket className="w-5 h-5" />
                {claim.pickupToken}
              </div>
              {!isExpired && (
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-1 bg-brand hover:bg-brand-active text-white text-[10px] font-bold rounded-lg px-2.5 py-1.5 transition-colors uppercase tracking-wider active:scale-95 shadow-sm cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" /> QR Code
                </button>
              )}
            </div>
            {claim.pickupTokenExpires && (
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                {isExpired ? (
                  <div className="flex items-center gap-2 text-rose-600">
                    <span>Expired</span>
                    <button
                      type="button"
                      onClick={() => onRerollToken(claim.itemId)}
                      disabled={rerollingItemId === claim.itemId}
                      className="px-2 py-1 bg-rose-100 hover:bg-rose-200 rounded text-[9px] flex items-center gap-1 disabled:opacity-50"
                    >
                      {rerollingItemId === claim.itemId ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Reroll
                    </button>
                  </div>
                ) : (
                  `Expires ${new Date(claim.pickupTokenExpires).toLocaleString()}`
                )}
              </div>
            )}
          </div>
        </>
      )}

      {showQrModal && (
        <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} className="max-w-md bg-slate-50 rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-brand" /> Pickup Verification
            </h3>
            <button type="button" onClick={() => setShowQrModal(false)} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer">
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
              {claim.pickupToken}
            </span>
          </div>
          <p className="mt-6 text-xs font-bold text-slate-500 leading-relaxed">
            Let the office administrator scan this QR code or input the alphanumeric token to verify and release your item.
          </p>
        </Modal>
      )}
    </div>
  )
}
