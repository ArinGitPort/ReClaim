import { useState } from "react"
import { CheckCircle2, Search, ShieldCheck, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { Input } from "@/components/ui/Input"
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
    storageLocation: string
    status: string
  }
}

export function InventoryHandoverModal({
  item,
  onClose,
  onCompleted,
}: {
  item: InventoryItemLite
  onClose: () => void
  onCompleted?: () => void
}) {
  const [tokenInput, setTokenInput] = useState("")
  const [preview, setPreview] = useState<HandoverPreview | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePreview(): Promise<void> {
    const token = tokenInput.trim()
    if (!token) {
      setError("Enter a pickup token first.")
      return
    }

    setIsSearching(true)
    setError(null)
    try {
      const response = await api.get<{ preview: HandoverPreview }>("/handover/preview", {
        params: { pickupToken: token },
      })

      const result = response.data.preview
      if (result.item.id !== item.id) {
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
  }

  async function handleConfirm(): Promise<void> {
    const token = tokenInput.trim()
    if (!token || !preview) {
      return
    }

    setIsConfirming(true)
    setError(null)
    try {
      await api.post("/handover/confirm", {
        pickupToken: token,
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
    const token = tokenInput.trim()
    if (!token || !preview) return

    setIsCancelling(true)
    setError(null)
    try {
      await api.post("/handover/cancel", { pickupToken: token })
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
        title="Start Handover"
        subtitle={`Target Item: ${item.code}`}
        icon={<ShieldCheck className="w-6 h-6 text-white" />}
        onClose={onClose}
        containerClassName="px-8 py-6 bg-white"
        iconWrapperClassName="bg-emerald-600 w-12 h-12"
        titleClassName="text-slate-900 text-xl"
      />

      <div className="p-6 border-b border-slate-100 bg-white space-y-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
          <Input
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="Enter pickup token"
            className="pl-12 h-11 bg-slate-50 border-slate-200"
          />
        </div>

        <Button disabled={isSearching} onClick={() => void handlePreview()} className="h-11 px-5 bg-brand hover:bg-brand-active text-white">
          {isSearching ? "Checking Token..." : "Preview Holder"}
        </Button>

        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/70 space-y-4">
        {!preview && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-slate-500">Validate token to load student and item details.</p>
          </div>
        )}

        {preview && (
          <>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Verified Claim</div>
              <div className="text-sm font-bold text-emerald-800">{preview.claimCode}</div>
              {preview.pickupTokenExpires && (
                <div className="text-xs font-semibold text-emerald-700 mt-1">
                  Expires: {new Date(preview.pickupTokenExpires).toLocaleString()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Student
                </div>
                <p className="text-sm font-bold text-slate-800">{preview.student.name}</p>
                <p className="text-xs font-semibold text-slate-500">Student ID: {preview.student.studentId ?? "N/A"}</p>
                <p className="text-xs font-semibold text-slate-500">Email: {preview.student.email}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" /> Item
                </div>
                <p className="text-sm font-bold text-slate-800">{preview.item.title}</p>
                <p className="text-xs font-semibold text-slate-500">Code: {preview.item.code}</p>
                <p className="text-xs font-semibold text-slate-500">Storage: {preview.item.storageLocation}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onClose} className="h-11 px-6">Close</Button>
        <div className="flex gap-3">
          {preview && (
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isConfirming || isCancelling}
              className="h-11 px-6 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              {isCancelling ? "Cancelling..." : "Cancel Handover"}
            </Button>
          )}
          <Button
            onClick={() => void handleConfirm()}
            disabled={!preview || isConfirming || isCancelling}
            className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isConfirming ? "Confirming..." : "Confirm Handover"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false)
          void handleCancelHandover()
        }}
        title="Cancel Handover"
        message="Are you sure you want to cancel this handover? The item will be made available again, and the claim will be cancelled."
        confirmText="Yes, Cancel Handover"
        cancelText="Keep Handover"
        isDestructive={true}
      />
    </div>
  )
}

