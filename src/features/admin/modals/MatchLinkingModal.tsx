import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Filter,
  MapPin,
  Package,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { formatShortDate } from "@/lib/formatters"
import { cn, getImageUrl } from "@/lib/utils"
import { api } from "@/lib/api"
import { useDebounce } from "@/lib/hooks/useDebounce"

type InventoryMatch = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundAtUtc: string
  date: string
  location: string
  status: string
  imageUrl?: string
  matchScore: number
  reasons: string[]
}

type MatchPrefill = {
  category: string
  color: string
  dateFrom: string
  location?: string
  brand?: string
  marks?: string
  privateNote?: string
}

type MatchCriteria = {
  category: string | null
  color: string | null
  dateFrom: string | null
  location: string | null
  brand: string | null
  marks: string | null
  privateNote: string | null
}

type AdminInventoryItem = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundAtUtc: string
  foundLocation: string
  status: string
  publicDescription?: string | null
  privateDiscoveryNote?: string | null
  privateData?: unknown
  aiEvidenceLogs?: Array<{
    snapshotPath?: string | null
  }>
}

type MatchLinkingModalProps = {
  onClose: () => void
  onLinked?: (matchedItemId: string) => void
  reportId: string
  reportCode: string
  itemTitle: string
  prefill?: MatchPrefill
}

export function MatchLinkingModal({ onClose, onLinked, reportId, reportCode, itemTitle, prefill }: MatchLinkingModalProps) {
  const [isLinking, setIsLinking] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidateItems, setCandidateItems] = useState<AdminInventoryItem[]>([])

  const debouncedSearch = useDebounce(searchText, 250)
  const criteria = useMemo<MatchCriteria>(() => ({
    category: getMeaningfulValue(prefill?.category),
    color: getMeaningfulValue(prefill?.color),
    dateFrom: getMeaningfulValue(prefill?.dateFrom),
    location: getMeaningfulValue(prefill?.location),
    brand: getMeaningfulValue(prefill?.brand),
    marks: getMeaningfulValue(prefill?.marks),
    privateNote: getMeaningfulValue(prefill?.privateNote),
  }), [prefill?.brand, prefill?.category, prefill?.color, prefill?.dateFrom, prefill?.location, prefill?.marks, prefill?.privateNote])
  const normalizedDate = criteria.dateFrom ? formatShortDate(criteria.dateFrom) : null
  const meaningfulColor = criteria.color
  const categoryFilter = criteria.category

  const prefillHint = [
    categoryFilter ? `Category: ${categoryFilter}` : null,
    meaningfulColor ? `Color: ${meaningfulColor}` : null,
    normalizedDate ? `Found after: ${normalizedDate}` : null,
    criteria.location ? `Near: ${criteria.location}` : null,
  ].filter(Boolean).join(" / ")

  useEffect(() => {
    setSearchText("")
    setSelectedMatch(null)
  }, [reportId])

  useEffect(() => {
    async function loadCandidates(): Promise<void> {
      setIsLoading(true)
      setError(null)

      try {
        const response = await api.get<{
          items: AdminInventoryItem[]
        }>("/items/admin", {
          params: {
            status: "AVAILABLE",
            limit: 100,
          },
        })

        setCandidateItems(response.data.items.filter((item) => item.status === "AVAILABLE"))
      } catch {
        setError("Unable to load inventory matches.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadCandidates()
  }, [reportId])

  const inventoryMatches = useMemo(() => {
    return candidateItems
      .map((item) => ({
        ...item,
        date: formatShortDate(item.foundAtUtc),
        location: item.foundLocation,
        imageUrl: getInventoryImageUrl(item),
        ...computeMatchSignal(item, itemTitle, criteria),
      }))
      .filter((item) => matchesSearch(item, debouncedSearch))
      .sort((a, b) => b.matchScore - a.matchScore || new Date(b.foundAtUtc).getTime() - new Date(a.foundAtUtc).getTime())
  }, [candidateItems, debouncedSearch, itemTitle, criteria])

  const selectedItem = useMemo(
    () => inventoryMatches.find((item) => item.id === selectedMatch),
    [inventoryMatches, selectedMatch]
  )

  const hasAssistedCriteria = Boolean(prefill)

  async function handleLink() {
    if (!selectedItem) {
      return
    }

    setError(null)
    setIsLinking(true)
    try {
      await api.patch(`/reports/${reportId}`, {
        status: "MATCHED",
        matchedItemId: selectedItem.id,
      })

      onLinked?.(selectedItem.id)

      setIsLinking(false)
      setConfirmed(true)
    } catch {
      setIsLinking(false)
      setError("Failed to link report with selected inventory item.")
    }
  }

  if (confirmed) {
    return (
      <div className="p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Report Linked!</h3>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto text-sm">
            {reportCode} is connected to {selectedItem?.code ?? "inventory"}. Student can now proceed with claim flow.
          </p>
        </div>
        <Button className="w-full h-12 bg-brand hover:bg-brand-active text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-sm" onClick={onClose}>Finish Workspace</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col max-h-[85vh] bg-white overflow-hidden rounded-xl">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Match Linker</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-2">
              Linking <span className="text-brand underline underline-offset-4">{reportCode || reportId}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/80">
        <div className="p-8 border-b border-slate-100 space-y-4 bg-white">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
            <Input
              placeholder="Search candidates by item, code, color, or location..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-12 h-12 bg-slate-50 border-slate-200 shadow-inner focus:bg-white focus:ring-4 focus:ring-brand/5 rounded-xl text-sm font-bold placeholder:text-slate-400"
            />
          </div>

          <div className="rounded-xl border border-brand/10 bg-brand/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand">
              <Sparkles className="w-3.5 h-3.5" />
              Assisted matching criteria
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              {prefillHint || "No report criteria available yet. Showing available inventory for manual review."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryFilter && <CriteriaPill label="Category" value={categoryFilter} />}
            {meaningfulColor && <CriteriaPill label="Color" value={meaningfulColor} />}
            {normalizedDate && <CriteriaPill label="Date hint" value={`After ${normalizedDate}`} />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Potential Matches ({inventoryMatches.length})</h4>
            {hasAssistedCriteria && (
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Ranked by report details
              </span>
            )}
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          {isLoading && <p className="text-xs font-semibold text-slate-500">Loading inventory candidates...</p>}

          {!isLoading && inventoryMatches.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">No candidates found</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Clear the search field or adjust the report criteria before linking.</p>
            </div>
          )}

          <div className="space-y-4">
            {inventoryMatches.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMatch(item.id)}
                className={cn(
                  "p-6 rounded-xl border transition-all cursor-pointer relative group flex items-start gap-4",
                  selectedMatch === item.id
                    ? "bg-white border-brand shadow-xl ring-2 ring-brand/10 z-10"
                    : "bg-white border-slate-200 shadow-sm hover:border-brand/30 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border transition-all overflow-hidden",
                  selectedMatch === item.id ? "bg-brand border-brand text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-brand/5 group-hover:text-brand"
                )}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-slate-500 font-mono tracking-tighter">{item.code}</span>
                    <MatchScoreBadge weight={item.matchScore} />
                  </div>
                  <h5 className="font-bold text-slate-900 text-[17px] leading-tight mb-2 truncate group-hover:text-brand transition-colors tracking-tight">{item.title}</h5>
                  <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </div>
                    <span>{item.category}</span>
                    <span>{item.color}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.reasons.map((reason) => (
                      <span key={reason} className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={cn(
                  "absolute right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border transition-all",
                  selectedMatch === item.id
                    ? "bg-brand border-brand text-white scale-110 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-300 group-hover:border-brand/20 group-hover:text-brand/40"
                )}>
                  {selectedMatch === item.id ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-slate-100 bg-white">
        {selectedMatch ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex-1 text-center sm:text-left">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-2">Ready to Connect</div>
              <div className="text-sm font-bold text-slate-900 tracking-tight">Manual verification of ownership confirmed.</div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none h-11 px-8 border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-500" onClick={() => setSelectedMatch(null)}>Change Choice</Button>
              <Button
                onClick={handleLink}
                disabled={isLinking || !selectedItem}
                className="flex-1 sm:flex-none h-11 px-10 bg-brand hover:opacity-90 text-white font-black uppercase tracking-widest text-[11px] shadow-sm rounded-xl transition-all active:scale-95"
              >
                {isLinking ? "Establishing Link..." : "Confirm & Notify"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 text-center text-slate-400">
            <div className="text-[10px] font-black uppercase tracking-[0.2em]">Select an inventory item to proceed with linking</div>
          </div>
        )}
      </div>
    </div>
  )
}

function CriteriaPill({ label, value }: { label: string; value: string }) {
  return (
    <Button variant="outline" size="sm" className="bg-white text-[10px] h-8 font-black uppercase tracking-widest border-slate-200 text-slate-500 rounded-lg">
      <Filter className="w-3 h-3 mr-2" /> {label}: {value}
    </Button>
  )
}

function computeMatchSignal(item: AdminInventoryItem, reportTitle: string, criteria: MatchCriteria): Pick<InventoryMatch, "matchScore" | "reasons"> {
  let score = 20
  const reasons: string[] = []
  const category = criteria.category
  const color = criteria.color
  const location = criteria.location
  const brand = criteria.brand
  const marks = criteria.marks
  const note = criteria.privateNote

  if (category && normalizedEquals(item.category, category)) {
    score += 25
    reasons.push("Category match")
  }

  if (color && normalizedEquals(item.color, color)) {
    score += 18
    reasons.push("Color match")
  }

  const itemText = [item.title, item.code, item.category, item.color, item.foundLocation, item.publicDescription, item.privateDiscoveryNote].join(" ")
  const titleOverlap = tokenOverlap(reportTitle, itemText)
  if (titleOverlap > 0) {
    score += Math.min(titleOverlap * 8, 24)
    reasons.push("Item wording match")
  }

  const detailOverlap = tokenOverlap([brand, marks, note].filter(Boolean).join(" "), itemText)
  if (detailOverlap > 0) {
    score += Math.min(detailOverlap * 6, 18)
    reasons.push("Report detail match")
  }

  if (location && tokenOverlap(location, item.foundLocation) > 0) {
    score += 10
    reasons.push("Location match")
  }

  const dateScore = computeDateScore(item.foundAtUtc, criteria.dateFrom ?? undefined)
  score += dateScore.score
  if (dateScore.reason) reasons.push(dateScore.reason)

  if (reasons.length === 0) {
    reasons.push("Available for manual review")
  }

  return { matchScore: Math.min(Math.max(score, 1), 99), reasons: reasons.slice(0, 4) }
}

function getInventoryImageUrl(item: AdminInventoryItem): string | undefined {
  const photoPath = extractPhotoPath(item.privateData) ?? item.aiEvidenceLogs?.find((log) => log.snapshotPath)?.snapshotPath
  return getImageUrl(photoPath)
}

function extractPhotoPath(privateData: unknown): string | undefined {
  if (!privateData || typeof privateData !== "object") return undefined

  const maybePhoto = (privateData as { photoUrl?: unknown }).photoUrl
  return typeof maybePhoto === "string" ? maybePhoto : undefined
}

function computeDateScore(foundAtUtc: string, dateFrom?: string): { score: number; reason?: string } {
  if (!dateFrom) return { score: 0 }

  const foundAt = new Date(foundAtUtc).getTime()
  const lostAt = new Date(dateFrom).getTime()
  if (!Number.isFinite(foundAt) || !Number.isFinite(lostAt)) return { score: 0 }

  const daysAfterLoss = (foundAt - lostAt) / (24 * 60 * 60 * 1000)
  if (daysAfterLoss < -1) {
    return { score: -12 }
  }
  if (daysAfterLoss <= 14) {
    return { score: 12, reason: "Found after loss date" }
  }
  if (daysAfterLoss <= 60) {
    return { score: 6, reason: "Date is plausible" }
  }

  return { score: 0 }
}

function matchesSearch(item: InventoryMatch, query: string): boolean {
  const tokens = normalizeText(query)
    .split(" ")
    .filter((token) => token.length > 1)

  if (tokens.length === 0) return true

  const haystack = normalizeText([
    item.code,
    item.title,
    item.category,
    item.color,
    item.location,
    item.reasons.join(" "),
  ].join(" "))

  return tokens.every((token) => haystack.includes(token))
}

function tokenOverlap(input: string, target: string): number {
  const inputTokens = new Set(
    normalizeText(input)
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  )
  if (inputTokens.size === 0) return 0

  const targetText = normalizeText(target)
  let count = 0
  inputTokens.forEach((token) => {
    if (targetText.includes(token)) count += 1
  })
  return count
}

function normalizedEquals(left: string, right: string): boolean {
  return normalizeText(left) === normalizeText(right)
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function getMeaningfulValue(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const normalized = normalizeText(trimmed)
  if (["not specified", "n a", "na", "unknown", "none"].includes(normalized)) return null
  return trimmed
}

function MatchScoreBadge({ weight }: { weight: number }) {
  const getStyles = () => {
    if (weight > 80) return "bg-emerald-100 text-emerald-800 border-emerald-200"
    if (weight > 50) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-slate-100 text-slate-600 border-slate-200"
  }

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border",
      getStyles()
    )}>
      {weight}% AI probability match
    </span>
  )
}

const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "item", "lost", "found", "not", "specified"])
