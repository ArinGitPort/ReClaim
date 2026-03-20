import { useEffect, useMemo, useState } from "react"
import { Eye, Search, ShieldCheck, X } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { api } from "@/lib/api"

type HandoverLogRow = {
  id: string
  pickupTokenPresented: string
  releasedAtUtc: string
  note?: string | null
  claim?: {
    claimCode: string
  } | null
  foundItem: {
    code: string
    title: string
    category: string
    storageLocation?: string | null
    status: string
  }
  releasedToUser: {
    name: string
    studentId?: string | null
    email: string
  }
}

export function HandoverLogPage() {
  const [logs, setLogs] = useState<HandoverLogRow[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [logsSearch, setLogsSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [selectedLog, setSelectedLog] = useState<HandoverLogRow | null>(null)

  async function loadHandoverLogs(search?: string): Promise<void> {
    setIsLoadingLogs(true)
    try {
      const response = await api.get<{ handovers: HandoverLogRow[] }>("/handover/logs", {
        params: search ? { search } : undefined,
      })
      setLogs(response.data.handovers)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  useEffect(() => {
    void loadHandoverLogs()
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadHandoverLogs(logsSearch.trim() || undefined)
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [logsSearch])

  const sourceOptions = useMemo(
    () => [
      { label: "Manual Claim", value: "CLAIM" },
      { label: "Report Match", value: "REPORT_MATCH" },
    ],
    []
  )

  const visibleLogs = useMemo(() => {
    return logs.filter((log) => {
      if (sourceFilter && getLogSource(log) !== sourceFilter) {
        return false
      }

      return true
    })
  }, [logs, sourceFilter])

  return (
    <div className="space-y-8">
      {selectedLog && (
        <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900">Handover Record Details</h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{selectedLog.claim?.claimCode ?? "No claim reference"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailBlock label="Released At" value={new Date(selectedLog.releasedAtUtc).toLocaleString()} />
                <DetailBlock label="Claim Code" value={selectedLog.claim?.claimCode ?? "N/A"} />
                <DetailBlock label="Pickup Token" value={selectedLog.pickupTokenPresented} mono />
                <DetailBlock label="Item Code" value={selectedLog.foundItem.code} mono />
                <DetailBlock label="Item Title" value={selectedLog.foundItem.title} />
                <DetailBlock label="Category" value={selectedLog.foundItem.category} />
                <DetailBlock label="Storage Location" value={selectedLog.foundItem.storageLocation ?? "Unassigned"} />
                <DetailBlock label="Item Status" value={selectedLog.foundItem.status.replaceAll("_", " ")} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Released To</div>
                <p className="mt-1 text-sm font-black text-slate-800">{selectedLog.releasedToUser.name}</p>
                <p className="text-xs font-semibold text-slate-600">Student ID: {selectedLog.releasedToUser.studentId ?? "N/A"}</p>
                <p className="text-xs font-semibold text-slate-600">Email: {selectedLog.releasedToUser.email}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verification Notes</div>
                <p className="mt-2 text-sm font-semibold text-slate-700">{selectedLog.note?.trim() ? selectedLog.note : "No verification notes recorded."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Handover Log</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Permanent record of successful returns and student handovers.</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={logsSearch}
              onChange={(e) => setLogsSearch(e.target.value)}
              placeholder="Search by source code, item, inventory code, or token"
              className="pl-10 h-11 bg-white border-slate-200"
            />
          </div>

          <div className="w-full lg:w-56">
            <Select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="h-11 bg-white border-slate-200"
            >
              <option value="">All Statuses</option>
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 px-4 border-slate-200 text-slate-600"
            disabled={!logsSearch.length && !sourceFilter.length}
            onClick={() => {
              setLogsSearch("")
              setSourceFilter("")
            }}
          >
            Reset
          </Button>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
          Showing {visibleLogs.length} result{visibleLogs.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Released At</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Claim</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Released To</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-600">{new Date(log.releasedAtUtc).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-bold text-slate-800">{log.foundItem.code}</div>
                    <div className="text-xs font-semibold text-slate-500">{log.foundItem.title} • {log.foundItem.category}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-600">{log.claim?.claimCode ?? "N/A"}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-700 font-mono">{log.pickupTokenPresented}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-bold text-slate-800">{log.releasedToUser.name}</div>
                    <div className="text-xs font-semibold text-slate-500">{log.releasedToUser.studentId ?? "N/A"}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-600">{log.note?.trim() ? log.note : "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedLog(log)}
                      className="h-8 border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {isLoadingLogs && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">Loading handover logs...</td>
                </tr>
              )}
              {!isLoadingLogs && visibleLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">No returned-item handover logs found for current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function getLogSource(log: HandoverLogRow): "CLAIM" | "REPORT_MATCH" {
  return log.claim?.claimCode ? "CLAIM" : "REPORT_MATCH"
}

function DetailBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={mono ? "mt-1 text-sm font-bold font-mono text-slate-700" : "mt-1 text-sm font-semibold text-slate-700"}>{value}</div>
    </div>
  )
}
