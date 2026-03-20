import { useCallback, useEffect, useMemo, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { FileText, Calendar, MapPin, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { RecordsFilterBar, RecordsStatusChips } from "@/features/user/RecordsFilterBar"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"

type ReportRealtimeEvent = {
  reportId: string
  reportCode: string
  status: string
  reporterUserId: string
  matchedItemId?: string | null
}

interface ReportView {
  ticketId: string
  id: string
  item: string
  category: string
  color: string
  dateFiled: string
  dateLost: string
  location: string
  timeWindow: string
  brand: string
  marks: string
  privateNote: string
  rawStatus: string
  status: string
}

export function MyReportsPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const [reports, setReports] = useState<ReportView[]>([])
  const [liveNotice, setLiveNotice] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const loadReports = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<{
        reports: Array<{
          id: string
          reportCode: string
          title: string
          category: string
          color: string
          location: string
          reportedLostAtUtc: string
          timeWindow?: string
          proofData?: Record<string, unknown>
          createdAt: string
          status: string
        }>
      }>("/reports", {
        params: {
          statusIn: "UNDER_REVIEW,ACTIVE_SEARCH,RESOLVED",
        },
      })

      const reportsData = response.data.reports || []
      setReports(
        reportsData.map((report) => {
          const proof = report.proofData ?? {}
          return {
            ticketId: report.id,
            id: report.reportCode,
            item: report.title,
            category: report.category,
            color: report.color,
            location: report.location,
            dateFiled: new Date(report.createdAt).toLocaleDateString(),
            dateLost: new Date(report.reportedLostAtUtc).toLocaleDateString(),
            timeWindow: report.timeWindow ?? "Not specified",
            brand: String(proof.brand ?? "Not specified"),
            marks: String(proof.marks ?? "Not provided"),
            privateNote: String(proof.privateNote ?? "Not provided"),
            rawStatus: report.status,
            status: toStudentStatusLabel(report.status),
          }
        })
      )
    } catch (err) {
      console.error("[REPORTS] Failed to load reports:", err)
      setReports([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadReports()
    })

    const intervalId = window.setInterval(() => {
      void loadReports()
    }, 5000)

    const handleFocus = () => {
      void loadReports()
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadReports()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [loadReports])

  async function handleCloseTicket(report: ReportView): Promise<void> {
    if (!isClosableReportStatus(report.rawStatus)) {
      return
    }

    setClosingTicketId(report.ticketId)
    try {
      await api.patch(`/reports/${report.ticketId}/close`)
      await loadReports()
    } finally {
      setClosingTicketId(null)
    }
  }

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return reports.filter((report) => {
      if (statusFilter && report.status !== statusFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = [report.id, report.item, report.category, report.color, report.location]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [reports, search, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, rowsPerPage])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredReports.length / rowsPerPage)), [filteredReports.length, rowsPerPage])

  const visibleReports = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredReports.slice(start, start + rowsPerPage)
  }, [filteredReports, page, rowsPerPage])

  const statusOptions = useMemo(() => {
    return Array.from(new Set(reports.map((report) => report.status))).map((status) => ({
      label: status,
      value: status,
    }))
  }, [reports])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) {
      return
    }

    const handleStatusUpdated = (event: ReportRealtimeEvent) => {
      if (event.status === "MATCHED") {
        setLiveNotice(`Good news! ${event.reportCode} has a match. Use Ready to Claim to view your pickup token.`)
      }
      void loadReports()
    }

    socket.on("report.status.updated", handleStatusUpdated)

    return () => {
      socket.off("report.status.updated", handleStatusUpdated)
    }
  }, [loadReports])

  return (
    <div className="w-full min-h-full pb-24">
      <TopNavBar title="My Lost Reports" />
      <div className="max-w-5xl mx-auto px-6 mt-8">
        {liveNotice && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {liveNotice}
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Tracking & Status</h2>
            <p className="text-slate-500 text-sm">View the items you reported lost and their search status.</p>
          </div>
          <Link
            to="/report-lost"
            className="flex items-center gap-2 text-sm font-bold text-brand hover:underline"
          >
            File New Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <RecordsFilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          statusValue={statusFilter}
          onStatusChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
          statusOptions={statusOptions}
          searchPlaceholder="Search by report code, item, category, color, or location"
        />

        <RecordsStatusChips
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          resultCount={filteredReports.length}
        />

        <div className="space-y-4">
          {visibleReports.map((report) => (
            <div
              key={report.id}
              className={cn(
                "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all",
                report.id.toUpperCase() === focusCode && "ring-2 ring-brand/40 border-brand bg-brand/3"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Icon */}
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {report.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {report.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {report.color}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{report.item}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {report.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Filed {report.dateFiled}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <ReportStatusBadge status={report.status} />
                  <ReportStatusMessage status={report.status} />
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <DetailField label="Date Lost" value={report.dateLost} />
                <DetailField label="Estimated Time Window" value={report.timeWindow} />
                <DetailField label="Brand/Model" value={report.brand} />
                <DetailField label="Distinguishing Marks" value={report.marks} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Private Note</div>
                  <div className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    {report.privateNote}
                  </div>
                </div>
                {isClosableReportStatus(report.rawStatus) && (
                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                    <button
                      type="button"
                      disabled={closingTicketId === report.ticketId}
                      onClick={() => void handleCloseTicket(report)}
                      className="h-10 px-4 rounded-lg border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {closingTicketId === report.ticketId ? "Closing..." : "Close Ticket"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {visibleReports.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
              No reports match your current filters.
            </div>
          )}
        </div>

        <AdminPaginationControls
          page={page}
          pageCount={pageCount}
          total={filteredReports.length}
          visibleCount={visibleReports.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(nextRows) => {
            setRowsPerPage(nextRows)
            setPage(1)
          }}
          itemLabel="reports"
        />
      </div>
    </div>
  )
}

function ReportStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Submitted": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Under Review": "bg-orange-50 text-orange-700 border-orange-200",
    "Active Search": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Closed": "bg-slate-100 text-slate-700 border-slate-300",
    "Rejected": "bg-rose-50 text-rose-700 border-rose-200",
  }

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-flex items-center gap-1.5",
      styles[status] ?? "bg-slate-50 text-slate-600 border-slate-100"
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}

function ReportStatusMessage({ status }: { status: string }) {
  const messages: Record<string, string> = {
    "Submitted": "Your report was received and is queued for admin review",
    "Under Review": "Admin is reviewing your report",
    "Active Search": "Administration has authorized this report and is actively searching",
    "Closed": "Report workflow is complete",
    "Rejected": "Report was reviewed and not authorized",
  }

  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <Clock className="w-3 h-3" /> {messages[status] ?? "Status updated"}
    </p>
  )
}

function toStudentStatusLabel(status: string): string {
  if (status === "RESOLVED") {
    return "Closed"
  }

  return status.replaceAll("_", " ")
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-700">{value}</div>
    </div>
  )
}

function isClosableReportStatus(status: string): boolean {
  return status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "ACTIVE_SEARCH"
}
