import { useState } from "react"
import { History, Search, ShieldCheck, CheckCircle2, User, Package } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { api } from "@/lib/api"

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

export function HandoverLogPage() {
  const [tokenInput, setTokenInput] = useState("")
  const [preview, setPreview] = useState<HandoverPreview | null>(null)
  const [note, setNote] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePreviewSearch(): Promise<void> {
    const token = tokenInput.trim()
    if (!token) {
      setError("Enter a pickup token to continue.")
      return
    }

    setIsSearching(true)
    setError(null)
    setMessage(null)
    try {
      const response = await api.get<{ preview: HandoverPreview }>("/handover/preview", {
        params: { pickupToken: token },
      })
      setPreview(response.data.preview)
    } catch {
      setPreview(null)
      setError("Token not found or no longer valid for handover.")
    } finally {
      setIsSearching(false)
    }
  }

  async function handleConfirm(): Promise<void> {
    const token = tokenInput.trim()
    if (!token || !preview) return

    setIsConfirming(true)
    setError(null)
    setMessage(null)
    try {
      await api.post("/handover/confirm", {
        pickupToken: token,
        idVerified: true,
        note: note || undefined,
      })

      setMessage(`Handover logged successfully for ${preview.item.code}.`)
      setPreview(null)
      setNote("")
      setTokenInput("")
    } catch {
      setError("Failed to confirm handover. Verify token and try again.")
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Handover Log</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Permanent record of successful returns and student handovers.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter pickup token (e.g. PK-AB12CD)"
              className="pl-10 h-11"
            />
          </div>
          <Button disabled={isSearching} onClick={() => void handlePreviewSearch()} className="h-11 px-6">
            {isSearching ? "Searching..." : "Preview"}
          </Button>
        </div>
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}

        {!preview && !error && !message && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <History className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Secure Handover Preview</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Validate pickup token to load student and item confirmation data.</p>
          </div>
        )}

        {preview && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-5">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Handover Preview Ready
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <User className="w-3.5 h-3.5" /> Student Data
                </div>
                <p className="text-sm font-bold text-slate-800">{preview.student.name}</p>
                <p className="text-xs font-semibold text-slate-500">Student ID: {preview.student.studentId ?? "N/A"}</p>
                <p className="text-xs font-semibold text-slate-500">Email: {preview.student.email}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Package className="w-3.5 h-3.5" /> Item Data
                </div>
                <p className="text-sm font-bold text-slate-800">{preview.item.title}</p>
                <p className="text-xs font-semibold text-slate-500">Code: {preview.item.code}</p>
                <p className="text-xs font-semibold text-slate-500">Category: {preview.item.category}</p>
                <p className="text-xs font-semibold text-slate-500">Storage: {preview.item.storageLocation}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verification Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                placeholder="Add any handover verification note..."
              />
            </div>

            <Button
              disabled={isConfirming}
              onClick={() => void handleConfirm()}
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isConfirming ? "Confirming..." : "Confirm & Log Handover"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
