import { useEffect, useMemo, useState } from "react"
import { ArrowRightLeft, CheckCircle2, Search, User, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

type InventoryItemLite = {
  id: string
  code: string
  title: string
  category: string
}

type CandidateReport = {
  id: string
  reportCode: string
  title: string
  category: string
  color: string
  status: string
  reporterName: string
  createdAt: string
}

export function InventoryLinkReportModal({
  item,
  onClose,
  onLinked,
}: {
  item: InventoryItemLite
  onClose: () => void
  onLinked?: () => void
}) {
  const [reports, setReports] = useState<CandidateReport[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [search, setSearch] = useState(`${item.title} ${item.category}`)
  const [isLoading, setIsLoading] = useState(true)
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadReports(search)
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  async function loadReports(query: string): Promise<void> {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{
        reports: Array<{
          id: string
          reportCode: string
          title: string
          category: string
          color: string
          status: string
          createdAt: string
          reporterUser: {
            name: string
          }
        }>
      }>("/reports", { params: { status: "ACTIVE_SEARCH" } })

      const normalizedQuery = query.trim().toLowerCase()
      const filtered = response.data.reports
        .filter((report) => {
          if (!normalizedQuery) {
            return true
          }

          const haystack = [report.reportCode, report.title, report.category, report.color, report.reporterUser.name]
            .join(" ")
            .toLowerCase()

          return haystack.includes(normalizedQuery)
        })
        .map((report) => ({
          id: report.id,
          reportCode: report.reportCode,
          title: report.title,
          category: report.category,
          color: report.color,
          status: report.status,
          reporterName: report.reporterUser.name,
          createdAt: report.createdAt,
        }))

      setReports(filtered)
    } catch {
      setError("Unable to load active reports for linking.")
    } finally {
      setIsLoading(false)
    }
  }

  const selected = useMemo(
    () => reports.find((report) => report.id === selectedReportId),
    [reports, selectedReportId]
  )

  async function handleLink(): Promise<void> {
    if (!selectedReportId) {
      return
    }

    setIsLinking(true)
    setError(null)
    try {
      await api.patch(`/reports/${selectedReportId}`, {
        status: "MATCHED",
        matchedItemId: item.id,
      })
      setSuccess(true)
      onLinked?.()
    } catch {
      setError("Failed to link selected report to item.")
    } finally {
      setIsLinking(false)
    }
  }

  if (success) {
    return (
      <div className="p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Link Complete</h3>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto text-sm">
            {selected?.reportCode ?? "Report"} is now linked to {item.code}.
          </p>
        </div>
        <Button className="w-full h-12 bg-brand hover:bg-brand-active text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-sm" onClick={onClose}>
          Close
        </Button>
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
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Link Report</h2>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Target Item: {item.code}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 border-b border-slate-100 bg-white">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search active reports"
            className="pl-12 h-11 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/70">
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        {isLoading && <p className="text-sm font-semibold text-slate-500">Loading active reports...</p>}
        {!isLoading && reports.length === 0 && (
          <p className="text-sm font-semibold text-slate-500">No active reports match your search.</p>
        )}

        {reports.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => setSelectedReportId(report.id)}
            className={cn(
              "w-full text-left rounded-xl border p-4 transition-all",
              selectedReportId === report.id
                ? "bg-white border-brand ring-2 ring-brand/10"
                : "bg-white border-slate-200 hover:border-brand/30"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{report.reportCode}</div>
                <h4 className="font-bold text-slate-900 mt-1">{report.title}</h4>
                <p className="text-xs font-semibold text-slate-500 mt-1">{report.category} • {report.color}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1"><User className="w-3 h-3" /> {report.reporterName}</p>
              </div>
              <div className="text-xs font-bold text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-6 py-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-500">
          {selected ? `Selected: ${selected.reportCode}` : "Select a report to link"}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="h-11 px-6">Cancel</Button>
          <Button onClick={() => void handleLink()} disabled={!selected || isLinking} className="h-11 px-8 bg-brand hover:bg-brand-active text-white">
            {isLinking ? "Linking..." : "Confirm Link"}
          </Button>
        </div>
      </div>
    </div>
  )
}
