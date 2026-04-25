import { StatusBadge } from "@/components/ui/StatusBadge"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FileText, Calendar, MapPin, ArrowRight, Clock, ShieldCheck, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { UniversalFilterBar } from "@/components/ui/UniversalFilterBar"
import { RecordsStatusChips } from "@/features/user/RecordsStatusChips"
import { SlidersHorizontal } from "lucide-react"
import { PaginationControls } from "@/components/ui/PaginationControls"

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
  pickupToken: string | null
  pickupTokenExpires: string | null
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
          matchedItem?: {
            claims?: Array<{
              pickupToken: string | null
              pickupTokenExpires: string | null
              claimantUserId: string
            }>
          } | null
        }>
      }>("/reports", {
        params: {
          statusIn: "UNDER_REVIEW,ACTIVE_SEARCH,MATCHED,RESOLVED",
        },
      })

      setReports(
        response.data.reports.map((report) => {
          const proof = report.proofData ?? {}
          const matchedClaim = report.matchedItem?.claims?.[0]
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
            pickupToken: matchedClaim?.pickupToken ?? null,
            pickupTokenExpires: matchedClaim?.pickupTokenExpires ?? null,
          }
        })
      )
    } catch {
      // Keep existing list visible during transient network failures.
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

        <UniversalFilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search by report code, item, category, color, or location"
          dropdowns={[
            {
              id: "status",
              icon: <SlidersHorizontal />,
              label: "Status",
              value: statusFilter,
              onChange: (value) => {
                setStatusFilter(value)
                setPage(1)
              },
              options: [
                { value: "", label: "All Statuses" },
                ...statusOptions
              ]
            }
          ]}
          onClear={search || statusFilter ? () => {
            setSearch("")
            setStatusFilter("")
            setPage(1)
          } : undefined}
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
                  <StatusBadge status={report.status} />
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
                {report.rawStatus === "MATCHED" && report.pickupToken && (
                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-emerald-800">Claim Approved — Pickup Token Issued</div>
                        <div className="text-xs font-semibold text-emerald-600 mt-0.5">Present this token and your ID at the Campus Admin Office.</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-200 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xl font-black text-emerald-800 tracking-wide">
                        <Ticket className="w-5 h-5" />
                        {report.pickupToken}
                      </div>
                      {report.pickupTokenExpires && (
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                          Expires {new Date(report.pickupTokenExpires).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

        <PaginationControls
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

function ReportStatusMessage({ status }: { status: string }) {
  const messages: Record<string, string> = {
    "Submitted": "Your report was received and is queued for admin review",
    "Under Review": "Admin is reviewing your report",
    "Active Search": "Administration has authorized this report and is actively searching",
    "Match Found": "A matching item has been found — check Token Wallet for pickup details",
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

  if (status === "MATCHED") {
    return "Match Found"
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

