import { useState, useEffect, useCallback, useRef } from "react"
import { CheckCircle2, ShieldCheck, User, Package, AlertCircle, MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { api } from "@/lib/api"

type InventoryItemLite = {
  id: string
  code: string
  title: string
  status: string
}

type HandoverPreview = {
  claimId: string
  claimCode: string
  pickupToken: string
  pickupTokenExpires?: string | null
  student: {
    id: string
    name: string
    studentId?: string | null
    email: string
  }
  item: {
    id: string
    code: string
    title: string
    category: string
    color?: string
    foundLocation?: string
    foundAtUtc?: string
    privateDiscoveryNote?: string
    storageLocation: string
    status: string
    photoUrl?: string
  }
}

export function InventoryHandoverModal({
  item,
  initialToken,
  onClose,
  onCompleted,
}: {
  item?: InventoryItemLite
  initialToken?: string
  onClose: () => void
  onCompleted?: () => void
}) {
  const [preview, setPreview] = useState<HandoverPreview | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePreview = useCallback(async (token: string): Promise<void> => {
    if (!token) return

    setIsSearching(true)
    setError(null)
    try {
      const response = await api.get<{ preview: HandoverPreview }>("/handover/preview", {
        params: { pickupToken: token },
      })

      const result = response.data.preview
      if (item && result.item.id !== item.id) {
        setPreview(null)
        setError("This pickup token belongs to a different item.")
        return
      }

      setPreview(result)
    } catch {
      setPreview(null)
      setError("Token not found or no longer valid for handover.")
    } finally {
      setIsSearching(false)
    }
  }, [item])

  const lastScannedRef = useRef<string | null>(null)

  useEffect(() => {
    if (initialToken && initialToken !== lastScannedRef.current) {
      lastScannedRef.current = initialToken
      void handlePreview(initialToken)
    }
  }, [initialToken, handlePreview])

  const handleRescan = () => {
    setError(null)
    setPreview(null)
  }

  async function handleConfirm(): Promise<void> {
    if (!initialToken || !preview) return

    setIsConfirming(true)
    setError(null)
    try {
      await api.post("/handover/confirm", {
        pickupToken: initialToken,
        idVerified: true,
      })

      onCompleted?.()
      onClose()
    } catch {
      setError("Failed to confirm handover. Please verify token and try again.")
    } finally {
      setIsConfirming(false)
    }
  }

  async function handleCancelHandover(): Promise<void> {
    if (!initialToken || !preview) return

    setIsCancelling(true)
    setError(null)
    try {
      await api.post("/handover/cancel", { pickupToken: initialToken })
      onCompleted?.()
      onClose()
    } catch {
      setError("Failed to cancel handover.")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="flex flex-col max-h-[85vh] bg-white overflow-hidden rounded-xl">
      <ModalHeader
        title="Pickup Handover Verification"
        subtitle={item ? `Item Release for Code: ${item.code}` : "Unified Handover & Release"}
        icon={<ShieldCheck className="w-6 h-6 text-white" />}
        onClose={onClose}
        containerClassName="px-8 py-6 bg-white"
        iconWrapperClassName="bg-emerald-600 w-12 h-12"
        titleClassName="text-slate-900 text-xl font-bold"
      />

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-slate-50/70 p-6 flex flex-col space-y-6">
        {isSearching && !preview && !error ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-500">Loading token details...</p>
          </div>
        ) : !preview && !error ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
             <div className="text-center max-w-sm mb-4">
                <h4 className="font-extrabold text-slate-800 text-sm">Manual Code Entry</h4>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Type the alphanumeric pickup token to verify the handover. Hardware scanners will automatically trigger this modal.
                </p>
             </div>
             <div className="w-full max-w-md bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="relative group">
                  <input
                    id="manual-token-input"
                    autoFocus
                    type="text"
                    placeholder="e.g. PK-XXXXXX"
                    className="w-full pl-4 pr-24 h-11 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        void handlePreview(e.currentTarget.value)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const val = (document.getElementById("manual-token-input") as HTMLInputElement)?.value;
                      if (val) void handlePreview(val);
                    }}
                    className="absolute right-1 top-1 bottom-1 h-9 px-4 bg-brand hover:bg-brand-active text-white text-xs font-bold rounded-md"
                  >
                    Lookup
                  </Button>
                </div>
                <p className="text-xs text-center font-semibold text-slate-400">Press Enter or click Lookup</p>
             </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <p className="text-base font-bold text-slate-800">Scan Failed</p>
            <p className="text-sm font-medium text-rose-600 text-center">{error}</p>
          </div>
        ) : preview ? (
          <div className="space-y-6">
            {preview.item.photoUrl && (
              <div className="w-full bg-slate-100 overflow-hidden rounded-xl border border-slate-200">
                 <img src={preview.item.photoUrl} alt={preview.item.title} className="w-full h-48 md:h-64 object-cover" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-2 flex flex-col justify-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Verified Claim Ticket
                </div>
                <div className="text-lg font-black text-emerald-800">{preview.claimCode}</div>
                {preview.pickupTokenExpires && (
                  <div className="text-xs font-semibold text-emerald-700">
                    Expires: {new Date(preview.pickupTokenExpires).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand" /> Student claimant
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800">{preview.student.name}</p>
                  <p className="text-xs font-bold text-slate-500">Student ID: {preview.student.studentId ?? "N/A"}</p>
                  <p className="text-xs font-semibold text-slate-400">Email: {preview.student.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={<Package className="w-4 h-4" />} label="Title" value={preview.item.title} />
              <InfoCard icon={<Package className="w-4 h-4" />} label="Category" value={preview.item.category} />
              <InfoCard icon={<Package className="w-4 h-4" />} label="Color" value={preview.item.color || "N/A"} />
              <InfoCard icon={<MapPin className="w-4 h-4" />} label="Found At" value={preview.item.foundLocation || "N/A"} />
              <InfoCard icon={<MapPin className="w-4 h-4" />} label="Found Date" value={preview.item.foundAtUtc ? new Date(preview.item.foundAtUtc).toLocaleString() : "N/A"} />
              <InfoCard icon={<MapPin className="w-4 h-4" />} label="Storage" value={preview.item.storageLocation} />
              <InfoCard icon={<AlertCircle className="w-4 h-4" />} label="Status" value={preview.item.status.replaceAll("_", " ")} />
            </div>

            {preview.item.privateDiscoveryNote && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-2">Sensitive Discovery Note</div>
                <p className="text-sm font-semibold text-amber-900">{preview.item.privateDiscoveryNote}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="px-6 py-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onClose} className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent">Close</Button>
        <div className="flex gap-3">
          {error && (
            <Button
              variant="outline"
              onClick={handleRescan}
              className="h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Rescan
            </Button>
          )}
          {preview && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isConfirming || isCancelling}
                className="h-11 px-6 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                {isCancelling ? "Cancelling..." : "Cancel Handover"}
              </Button>
              <Button
                onClick={() => setShowStartConfirm(true)}
                disabled={isConfirming || isCancelling}
                className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs active:scale-95 transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isConfirming ? "Confirming..." : "Confirm Handover"}
              </Button>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showStartConfirm}
        onClose={() => setShowStartConfirm(false)}
        onConfirm={() => {
          setShowStartConfirm(false)
          void handleConfirm()
        }}
        title="Confirm Handover Release"
        message={preview ? `Confirm that ${preview.student.name} has presented valid ID and should receive the claimed ${preview.item.title}? This will release the item.` : "Confirm this handover?"}
        confirmText="Yes, Release Item"
        cancelText="Review Details"
        isLoading={isConfirming}
        confirmButtonClassName="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false)
          void handleCancelHandover()
        }}
        title="Cancel Handover & Claim"
        message="Are you sure you want to cancel this handover? The item will return to Available inventory, and the claim ticket will be cancelled."
        confirmText="Yes, Cancel Handover"
        cancelText="Keep Handover"
        isDestructive={true}
        confirmButtonClassName="rounded-xl"
      />
    </div>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-1">{icon} {label}</div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
    </div>
  )
}
