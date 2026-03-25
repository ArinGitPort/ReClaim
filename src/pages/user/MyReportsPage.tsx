import { useCallback, useEffect, useMemo, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { FileText, Calendar, MapPin, ArrowRight, Clock } from "lucide-react"
import { DataRow } from "@/components/ui/DataRow"
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
    <div style={{ width: '100%', minHeight: '100%', paddingBottom: '6rem' }}>
      <TopNavBar title="My Lost Reports" />
      <div style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto', padding: '0 1.5rem', marginTop: '2rem' }}>
        {liveNotice && (
          <div style={{ marginBottom: '1.5rem', borderRadius: '0.75rem', border: '1px solid #A7F3D0', backgroundColor: '#ECFDF5', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#047857' }}>
            {liveNotice}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0F172A', marginBottom: '0.25rem', margin: 0 }}>Tracking & Status</h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>View the items you reported lost and their search status.</p>
          </div>
          <Link
            to="/report-lost"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#1E2F85', textDecoration: 'none' }}
          >
            File New Report <ArrowRight style={{ width: '1rem', height: '1rem' }} />
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibleReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              focusCode={focusCode}
              isClosing={closingTicketId === report.ticketId}
              onCloseTicket={() => void handleCloseTicket(report)}
            />
          ))}
          {visibleReports.length === 0 && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '2rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748B' }}>
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

function ReportCard({
  report,
  focusCode,
  isClosing,
  onCloseTicket,
}: {
  report: ReportView
  focusCode: string
  isClosing: boolean
  onCloseTicket: () => void
}) {
  const cardStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    padding: '1.5rem',
  }

  const isFocused = report.id.toUpperCase() === focusCode
  const focusStyles: React.CSSProperties = isFocused ? {
    boxShadow: '0 0 0 2px rgba(30, 47, 133, 0.4)',
    borderColor: '#1E2F85',
    backgroundColor: 'rgba(30, 47, 133, 0.03)'
  } : {}

  const badgeStyles: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94A3B8',
    backgroundColor: '#F8FAFC',
    border: '1px solid #F1F5F9',
    padding: '0.125rem 0.5rem',
    borderRadius: '0.25rem'
  }

  return (
    <div style={{ ...cardStyles, ...focusStyles }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem' }}>
          {/* Icon */}
          <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText style={{ width: '1.75rem', height: '1.75rem', color: '#94A3B8' }} />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ ...badgeStyles, fontFamily: 'monospace' }}>
                {report.id}
              </span>
              <span style={badgeStyles}>
                {report.category}
              </span>
              <span style={badgeStyles}>
                {report.color}
              </span>
            </div>
            <h3 style={{ fontWeight: 'bold', color: '#0F172A', fontSize: '1.125rem', lineHeight: '1.25', margin: 0 }}>{report.item}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '11px', fontWeight: 'bold', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
                {report.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                Filed {report.dateFiled}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flexShrink: 0 }}>
            <ReportStatusBadge status={report.status} />
            <ReportStatusMessage status={report.status} />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
          <DataRow label="Date Lost" value={report.dateLost} />
          <DataRow label="Estimated Time Window" value={report.timeWindow} />
          <DataRow label="Brand/Model" value={report.brand} />
          <DataRow label="Distinguishing Marks" value={report.marks} />
          <div style={{ gridColumn: 'span 3' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Your Private Note</div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
              {report.privateNote}
            </div>
          </div>
          {isClosableReportStatus(report.rawStatus) && (
            <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={isClosing}
                onClick={onCloseTicket}
                style={{ 
                  height: '2.5rem', 
                  padding: '0 1rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #FECACA', 
                  backgroundColor: '#FEE2E2', 
                  color: '#B91C1C', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  cursor: 'pointer',
                  opacity: isClosing ? 0.5 : 1
                }}
              >
                {isClosing ? "Closing..." : "Close Ticket"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReportStatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    "Submitted": { backgroundColor: '#ECFEFF', color: '#0891B2', borderColor: '#CFFAFE' },
    "Under Review": { backgroundColor: '#FFF7ED', color: '#D97706', borderColor: '#FFEDD5' },
    "Active Search": { backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#D1FAE5' },
    "Closed": { backgroundColor: '#F1F5F9', color: '#334155', borderColor: '#E2E8F0' },
    "Rejected": { backgroundColor: '#FFF1F2', color: '#E11D48', borderColor: '#FFE4E6' },
  }

  const baseStyle: React.CSSProperties = {
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem'
  }

  const currentStyle = styles[status] ?? { backgroundColor: '#F8FAFC', color: '#64748B', borderColor: '#F1F5F9' }

  return (
    <span style={{ ...baseStyle, ...currentStyle }}>
      <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', backgroundColor: 'currentColor', opacity: 0.7 }} />
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
    <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
      <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> {messages[status] ?? "Status updated"}
    </p>
  )
}

function toStudentStatusLabel(status: string): string {
  if (status === "RESOLVED") {
    return "Closed"
  }

  return status.replaceAll("_", " ")
}

function isClosableReportStatus(status: string): boolean {
  return status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "ACTIVE_SEARCH"
}
