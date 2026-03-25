import { useCallback, useEffect, useMemo, useState } from "react"
import {
  FileText,
  FileSearch,
  Link2,
  User,
  ShieldAlert,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare
} from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { DataRow } from "@/components/ui/DataRow"
import { DetailSection } from "@/components/ui/DetailSection"
import { Button } from "@/components/ui/Button"
import { MatchLinkingModal } from "@/features/admin/MatchLinkingModal"
import { api } from "@/lib/api"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"
import { getRealtimeSocket } from "@/lib/realtime"
import { useSearchParams } from "react-router-dom"

const pageContainerStyles: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '2rem' 
}

const modalOverlayStyles: React.CSSProperties = { 
  position: 'fixed', 
  inset: 0, 
  zIndex: 100, 
  display: 'flex', 
  alignItems: 'flex-start', 
  justifyContent: 'center', 
  overflowY: 'auto', 
  padding: '2.5rem 1rem' 
}

const modalBackdropStyles: React.CSSProperties = { 
  position: 'fixed', 
  inset: 0, 
  backgroundColor: 'rgba(15, 23, 42, 0.8)' 
}

const modalContentStyles: React.CSSProperties = { 
  position: 'relative', 
  width: '100%', 
  maxWidth: '64rem', 
  backgroundColor: '#FFFFFF', 
  borderRadius: '0.75rem', 
  overflow: 'hidden', 
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
  border: '1px solid #E2E8F0', 
  margin: 'auto' 
}

const headerWrapperStyles: React.CSSProperties = { 
  marginBottom: '2rem' 
}

const headerTitleStyles: React.CSSProperties = { 
  fontSize: '1.875rem', 
  fontWeight: 800, 
  color: '#0F172A', 
  letterSpacing: '-0.025em', 
  margin: 0 
}

const headerSubtitleStyles: React.CSSProperties = { 
  color: '#64748B', 
  fontSize: '0.875rem', 
  fontWeight: 500, 
  marginTop: '0.25rem', 
  margin: '0.25rem 0 0 0' 
}

const splitViewWrapperStyles: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'row', 
  gap: '2rem', 
  alignItems: 'flex-start' 
}

const sidebarWrapperStyles: React.CSSProperties = { 
  flex: '0 0 24rem', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '1rem' 
}

const filterContainerStyles: React.CSSProperties = { 
  backgroundColor: '#FFFFFF', 
  padding: '1rem', 
  borderRadius: '0.75rem', 
  border: '1px solid #E2E8F0', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '0.75rem' 
}

const searchInputWrapperStyles: React.CSSProperties = { 
  position: 'relative' 
}

const searchIconStyles: React.CSSProperties = { 
  position: 'absolute', 
  left: '1rem', 
  top: '50%', 
  transform: 'translateY(-50%)', 
  width: '1rem', 
  height: '1rem', 
  color: '#94A3B8' 
}

const searchInputStyles: React.CSSProperties = { 
  width: '100%', 
  height: '2.75rem', 
  paddingLeft: '2.75rem', 
  paddingRight: '1rem', 
  backgroundColor: '#F8FAFC', 
  border: '1px solid #F1F5F9', 
  borderRadius: '0.75rem', 
  fontSize: '0.875rem', 
  fontWeight: 500, 
  outline: 'none', 
  boxSizing: 'border-box' 
}

const categoryFilterRowStyles: React.CSSProperties = { 
  display: 'flex', 
  gap: '0.5rem', 
  paddingBottom: '0.25rem', 
  overflowX: 'auto' 
}

const categoryBtnBaseStyles: React.CSSProperties = { 
  padding: '0.375rem 1rem', 
  borderRadius: '9999px', 
  fontSize: '10px', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.05em', 
  whiteSpace: 'nowrap', 
  cursor: 'pointer', 
  border: '1px solid', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
}

const workspaceContainerStyles: React.CSSProperties = { 
  flex: 1, 
  backgroundColor: '#FFFFFF', 
  borderRadius: '0.75rem', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  border: '1px solid #E2E8F0', 
  overflow: 'hidden', 
  minHeight: '44rem', 
  display: 'flex', 
  flexDirection: 'column', 
  position: 'relative' 
}

const emptyWorkspaceWrapperStyles: React.CSSProperties = { 
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  padding: '3rem', 
  textAlign: 'center' 
}

const emptyWorkspaceIconWrapperStyles: React.CSSProperties = { 
  width: '8rem', 
  height: '8rem', 
  backgroundColor: '#F8FAFC', 
  borderRadius: '9999px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  border: '1px solid #F1F5F9', 
  marginBottom: '1.5rem' 
}

const reportCardStyles = (isSelected: boolean, isFocused: boolean): React.CSSProperties => ({
  padding: '1.25rem',
  backgroundColor: '#FFFFFF',
  borderRadius: '1rem',
  border: '1px solid',
  borderColor: isSelected ? '#1E2F85' : (isFocused ? 'rgba(30, 47, 133, 0.5)' : '#F1F5F9'),
  boxShadow: isSelected ? '0 0 0 2px rgba(30, 47, 133, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  transform: isSelected ? 'scale(1.01)' : 'none'
})

const reportCardSelectionIndicatorStyles: React.CSSProperties = { 
  position: 'absolute', 
  left: 0, 
  top: 0, 
  bottom: 0, 
  width: '0.375rem', 
  backgroundColor: '#1E2F85' 
}

const reportCardHeaderStyles: React.CSSProperties = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'flex-start', 
  marginBottom: '0.75rem' 
}

const reportCardCodeBadgeStyles: React.CSSProperties = { 
  fontSize: '10px', 
  fontWeight: 700, 
  color: '#94A3B8', 
  fontFamily: 'monospace', 
  letterSpacing: '-0.025em', 
  backgroundColor: '#F8FAFC', 
  padding: '0.125rem 0.5rem', 
  borderRadius: '0.25rem', 
  border: '1px solid #F1F5F9' 
}

const reportCardTitleStyles: React.CSSProperties = { 
  fontWeight: 700, 
  color: '#1E293B', 
  fontSize: '15px', 
  marginBottom: '0.25rem', 
  whiteSpace: 'nowrap', 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  margin: 0 
}

const reportCardFooterStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  fontSize: '10px', 
  fontWeight: 800, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  color: 'rgba(30, 47, 133, 0.6)', 
  backgroundColor: 'rgba(30, 47, 133, 0.05)', 
  margin: '1rem -1.25rem -1.25rem', 
  padding: '0.625rem 1.25rem' 
}

const workspaceHeaderStyles: React.CSSProperties = { 
  padding: '1.5rem', 
  borderBottom: '1px solid #F1F5F9', 
  backgroundColor: 'rgba(248, 250, 252, 0.5)', 
  display: 'flex', 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  gap: '1rem' 
}

const workspaceHeaderIconWrapperStyles: React.CSSProperties = { 
  width: '2.5rem', 
  height: '2.5rem', 
  backgroundColor: '#1E2F85', 
  borderRadius: '0.75rem', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
}

const workspaceHeaderTitleStyles: React.CSSProperties = { 
  fontSize: '1rem', 
  fontWeight: 700, 
  color: '#0F172A', 
  letterSpacing: '-0.025em', 
  textTransform: 'uppercase', 
  textDecoration: 'underline', 
  textUnderlineOffset: '4px', 
  textDecorationColor: 'rgba(30, 47, 133, 0.2)', 
  textDecorationThickness: '2px', 
  margin: 0 
}

const workspaceActionBtnStyles: React.CSSProperties = { 
  height: '2.5rem', 
  padding: '0 1rem', 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #E2E8F0', 
  color: '#475569', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  fontSize: '10px', 
  borderRadius: '0.5rem', 
  display: 'flex', 
  alignItems: 'center', 
  cursor: 'pointer' 
}

const matchInventoryBtnStyles = (isAuthorized: boolean): React.CSSProperties => ({ 
  height: '2.5rem', 
  padding: '0 1.5rem', 
  backgroundColor: isAuthorized ? '#1E2F85' : '#CBD5E1', 
  color: '#FFFFFF', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  fontSize: '10px', 
  borderRadius: '0.5rem', 
  border: 'none', 
  cursor: isAuthorized ? 'pointer' : 'not-allowed', 
  display: 'flex', 
  alignItems: 'center', 
  boxShadow: isAuthorized ? '0 10px 15px -3px rgba(30, 47, 133, 0.2)' : 'none', 
  boxSizing: 'border-box' 
})

const authorizationNoticeStyles: React.CSSProperties = { 
  padding: '0 1.5rem 1.25rem', 
  fontSize: '11px', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  color: '#15803D' 
}

const workspaceGridStyles: React.CSSProperties = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(2, 1fr)', 
  gap: '3rem' 
}

const proofDataContainerStyles: React.CSSProperties = { 
  padding: '1.5rem', 
  backgroundColor: 'rgba(30, 47, 133, 0.05)', 
  borderRadius: '0.75rem', 
  border: '1px solid rgba(30, 47, 133, 0.1)', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '0.75rem' 
}

const proofBadgeStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  fontSize: '10px', 
  fontWeight: 700, 
  color: 'rgba(30, 47, 133, 0.6)', 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  fontFamily: 'monospace', 
  padding: '0.25rem 0.75rem', 
  backgroundColor: 'rgba(30, 47, 133, 0.05)', 
  borderRadius: '0.5rem', 
  width: 'fit-content', 
  margin: 0 
}

const linkedAssetContainerStyles: React.CSSProperties = { 
  padding: '1.5rem', 
  backgroundColor: 'rgba(16, 185, 129, 0.05)', 
  borderRadius: '0.75rem', 
  border: '1px solid #BBF7D0', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '0.75rem' 
}

const privacyDataWrapperStyles: React.CSSProperties = { 
  padding: '1.5rem', 
  backgroundColor: 'rgba(248, 250, 252, 0.5)', 
  borderRadius: '0.75rem', 
  border: '1px solid #E2E8F0', 
  borderStyle: 'dashed', 
  position: 'relative' 
}

const revealBtnStyles: React.CSSProperties = { 
  backgroundColor: '#1E2F85', 
  color: '#FFFFFF', 
  fontWeight: 700, 
  letterSpacing: '0.1em', 
  height: '2.25rem', 
  padding: '0 1.5rem', 
  borderRadius: '0.5rem', 
  textTransform: 'uppercase', 
  fontSize: '10px', 
  border: 'none', 
  cursor: 'pointer', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
}

const attachmentPlaceholderStyles: React.CSSProperties = { 
  width: '100%', 
  aspectRatio: '16/9', 
  backgroundColor: '#F8FAFC', 
  borderRadius: '0.75rem', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  border: '1px solid #F1F5F9', 
  borderStyle: 'dashed' 
}

const decisionFooterStyles: React.CSSProperties = { 
  paddingTop: '2rem', 
  borderTop: '1px solid #F1F5F9', 
  display: 'flex', 
  gap: '1rem' 
}

const rejectBtnStyles: React.CSSProperties = { 
  flex: 1, 
  height: '3rem', 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #FEE2E2', 
  color: '#EF4444', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  fontSize: '10px', 
  borderRadius: '0.75rem', 
  cursor: 'pointer', 
  boxSizing: 'border-box' 
}

const authorizeBtnStyles: React.CSSProperties = { 
  flex: 2, 
  height: '3rem', 
  backgroundColor: '#059669', 
  color: '#FFFFFF', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  fontSize: '10px', 
  borderRadius: '0.75rem', 
  border: 'none', 
  cursor: 'pointer', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  boxSizing: 'border-box' 
}

type ReportStatus = "SUBMITTED" | "UNDER_REVIEW" | "ACTIVE_SEARCH" | "MATCHED" | "RESOLVED" | "REJECTED"

type ReportRow = {
  id: string
  code: string
  student: string
  studentId: string
  item: string
  category: string
  color: string
  brand: string
  date: string
  location: string
  timeWindow: string
  status: ReportStatus
  deviceName?: string
  nameOnDoc?: string
  marks: string
  privateNote: string
  reportedLostAtUtcRaw: string
  linkedItem?: {
    id: string
    code: string
    title: string
    category: string
    color: string
    storageLocation: string
    status: string
  }
}

export function MissingItemsPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const [reports, setReports] = useState<ReportRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [revealedPrivateNotes, setRevealedPrivateNotes] = useState<Record<string, boolean>>({})
  const [showLinker, setShowLinker] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [pageCount, setPageCount] = useState(1)
  const [totalReports, setTotalReports] = useState(0)

  const loadReports = useCallback(async (silent = false): Promise<void> => {
    if (!silent) {
      setIsLoading(true)
    }

    setError(null)
    try {
      const pagedResponse = await api.get<{
        reports: Array<{
          id: string
          reportCode: string
          title: string
          category: string
          color: string
          location: string
          reportedLostAtUtc: string
          timeWindow?: string
          status: ReportStatus
          proofData?: Record<string, unknown>
          reporterUser?: { name: string; studentId?: string | null }
          matchedItem?: {
            id: string
            code: string
            title: string
            category: string
            color: string
            storageLocation?: string | null
            status: string
          } | null
        }>
        pagination: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/reports", {
        params: {
          statusIn: "SUBMITTED,UNDER_REVIEW,ACTIVE_SEARCH",
          search: searchQuery.trim() || undefined,
          page,
          limit: rowsPerPage,
        },
      })

      const mapped = pagedResponse.data.reports.map((entry) => {
        const proof = entry.proofData ?? {}
        return {
          id: entry.id,
          code: entry.reportCode,
          student: entry.reporterUser?.name ?? "Unknown Student",
          studentId: entry.reporterUser?.studentId ?? "N/A",
          item: entry.title,
          category: entry.category,
          color: entry.color,
          brand: String(proof.brand ?? "Not specified"),
          date: new Date(entry.reportedLostAtUtc).toLocaleDateString(),
          location: entry.location,
          timeWindow: entry.timeWindow ?? "Not specified",
          status: entry.status,
          deviceName: typeof proof.deviceName === "string" ? proof.deviceName : undefined,
          nameOnDoc: typeof proof.nameOnDoc === "string" ? proof.nameOnDoc : undefined,
          marks: String(proof.marks ?? "Not provided"),
          privateNote: String(proof.privateNote ?? "Not provided"),
          reportedLostAtUtcRaw: entry.reportedLostAtUtc,
          linkedItem: entry.matchedItem
            ? {
                id: entry.matchedItem.id,
                code: entry.matchedItem.code,
                title: entry.matchedItem.title,
                category: entry.matchedItem.category,
                color: entry.matchedItem.color,
                storageLocation: entry.matchedItem.storageLocation ?? "Unassigned",
                status: entry.matchedItem.status,
              }
            : undefined,
        }
      })

      setReports(mapped)
      setTotalReports(pagedResponse.data.pagination.total)
      setPageCount(pagedResponse.data.pagination.pageCount)
      setSelectedReport((prev) => {
        if (prev && mapped.some((row) => row.id === prev)) {
          return prev
        }
        return mapped[0]?.id ?? null
      })
    } catch {
      if (!silent) {
        setError("Unable to load reports. Please refresh and try again.")
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [page, rowsPerPage, searchQuery])

  useEffect(() => {
    void loadReports()

    const intervalId = window.setInterval(() => {
      void loadReports(true)
    }, 5000)

    const handleFocus = () => {
      void loadReports(true)
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
    }
  }, [loadReports])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) {
      return
    }

    const handleStatusUpdated = () => {
      void loadReports(true)
    }

    socket.on("report.status.updated", handleStatusUpdated)

    return () => {
      socket.off("report.status.updated", handleStatusUpdated)
    }
  }, [loadReports])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, rowsPerPage])

  useEffect(() => {
    if (!focusCode || reports.length === 0) {
      return
    }

    const matchedReport = reports.find((row) => row.code.toUpperCase() === focusCode)
    if (matchedReport) {
      setSelectedReport(matchedReport.id)
    }
  }, [focusCode, reports])

  const filteredReports = useMemo(
    () => reports.filter((row) => {
      const normalizedRowCategory = row.category.toLowerCase()
      const normalizedFilterCategory = categoryFilter.toLowerCase()

      if (categoryFilter === "All") {
        return true
      }

      if (normalizedFilterCategory === "wallets/ids") {
        return normalizedRowCategory.includes("wallet") || normalizedRowCategory.includes("id")
      }

      if (normalizedFilterCategory === "everyday items") {
        return normalizedRowCategory.includes("everyday")
      }

      return normalizedRowCategory.includes(normalizedFilterCategory)
    }),
    [reports, categoryFilter]
  )

  const triageReports = useMemo(
    () => filteredReports.filter((row) => row.status === "SUBMITTED" || row.status === "UNDER_REVIEW" || row.status === "ACTIVE_SEARCH"),
    [filteredReports]
  )

  const report = reports.find(r => r.id === selectedReport)
  const isPrivateNoteVisible = report ? Boolean(revealedPrivateNotes[report.id]) : false
  const canReviewReport = report ? (report.status === "SUBMITTED" || report.status === "UNDER_REVIEW") : false
  const isAuthorized = report?.status === "ACTIVE_SEARCH"

  async function updateReportStatus(nextStatus: ReportStatus): Promise<void> {
    if (!report) return
    setIsUpdating(true)
    setError(null)
    try {
      await api.patch(`/reports/${report.id}`, { status: nextStatus })
      setReports((prev) => prev.map((row) => (row.id === report.id ? { ...row, status: nextStatus } : row)))
    } catch {
      setError("Failed to update report status.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div style={pageContainerStyles}>
      {showLinker && selectedReport && (
        <div style={modalOverlayStyles}>
          <div style={modalBackdropStyles} onClick={() => setShowLinker(false)} />
          <div style={modalContentStyles}>
            <MatchLinkingModal
              reportId={reports.find(r => r.id === selectedReport)?.id || selectedReport}
              reportCode={reports.find(r => r.id === selectedReport)?.code || ""}
              itemTitle={reports.find(r => r.id === selectedReport)?.item || "Item"}
              onLinked={() => {
                const currentId = selectedReport
                if (!currentId) return
                setReports((prev) => prev.map((row) => (
                  row.id === currentId ? { ...row, status: "MATCHED" } : row
                )))
              }}
              prefill={report ? {
                category: report.category,
                color: report.color,
                dateFrom: report.reportedLostAtUtcRaw,
              } : undefined}
              onClose={() => setShowLinker(false)}
            />
          </div>
        </div>
      )}

      <div style={headerWrapperStyles}>
        <h1 style={headerTitleStyles}>Missing Items</h1>
        <p style={headerSubtitleStyles}>Monitor and verify incoming student lost reports against system records.</p>
      </div>

      <div style={splitViewWrapperStyles}>
        <div style={sidebarWrapperStyles}>
          {/* Filter Section */}
          <div style={filterContainerStyles}>
            <div style={searchInputWrapperStyles}>
              <FileSearch style={searchIconStyles} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                style={searchInputStyles}
              />
            </div>
            <div style={categoryFilterRowStyles}>
              {["All", "Electronics", "Wallets/IDs", "Everyday Items"].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat)
                    setPage(1)
                  }}
                  style={{
                    ...categoryBtnBaseStyles,
                    backgroundColor: cat === categoryFilter ? '#1E2F85' : '#FFFFFF',
                    color: cat === categoryFilter ? '#FFFFFF' : '#64748B',
                    borderColor: cat === categoryFilter ? '#1E2F85' : '#E2E8F0',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {triageReports.map((r) => (
              <MissingReportCard 
                key={r.id} 
                report={r} 
                isSelected={selectedReport === r.id} 
                isFocused={r.code.toUpperCase() === focusCode}
                onClick={() => setSelectedReport(r.id)} 
              />
            ))}
            {isLoading && (
              <div style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                Loading reports...
              </div>
            )}
            {!isLoading && triageReports.length === 0 && (
              <div style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                No active reports in triage queue.
              </div>
            )}

            <AdminPaginationControls
              page={page}
              pageCount={pageCount}
              total={totalReports}
              visibleCount={triageReports.length}
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

        {/* Detailed Workspace Area */}
        <div style={workspaceContainerStyles}>
          {report ? (
            <ReportWorkspace
              report={report}
              isAuthorized={isAuthorized}
              isUpdating={isUpdating}
              error={error}
              isPrivateNoteVisible={isPrivateNoteVisible}
              canReviewReport={canReviewReport}
              onMatchInventory={() => setShowLinker(true)}
              onUpdateStatus={(status) => void updateReportStatus(status)}
              onTogglePrivateNote={(visible) => {
                setRevealedPrivateNotes((prev) => ({ ...prev, [report.id]: visible }))
              }}
            />
          ) : (
            <div style={emptyWorkspaceWrapperStyles}>
              <div style={emptyWorkspaceIconWrapperStyles}>
                <FileText style={{ width: '3rem', height: '3rem', color: '#E2E8F0' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>Accessing Queue...</h3>
                <p style={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Select a report from the list to begin system verification.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MissingReportCard({ 
  report, 
  isSelected, 
  isFocused, 
  onClick 
}: { 
  report: ReportRow
  isSelected: boolean
  isFocused: boolean
  onClick: () => void 
}) {
  return (
    <div
      onClick={onClick}
      style={reportCardStyles(isSelected, isFocused)}
    >
      {isSelected && <div style={reportCardSelectionIndicatorStyles} />}

      <div style={reportCardHeaderStyles}>
        <span style={reportCardCodeBadgeStyles}>
          {report.code}
        </span>
        <StatusBadge status={report.status} />
      </div>
      <h4 style={reportCardTitleStyles}>
        {report.item}
      </h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginBottom: '1rem' }}>
        <User style={{ width: '0.75rem', height: '0.75rem', color: '#CBD5E1', flexShrink: 0 }} />
        {report.student}
      </div>
      <div style={reportCardFooterStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Calendar style={{ width: '0.75rem', height: '0.75rem' }} />
          {report.date}
        </div>
        <span style={{ backgroundColor: '#FFFFFF', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid rgba(30, 47, 133, 0.1)' }}>{report.category}</span>
      </div>
    </div>
  )
}

function ReportWorkspace({
  report,
  isAuthorized,
  isUpdating,
  error,
  isPrivateNoteVisible,
  canReviewReport,
  onMatchInventory,
  onUpdateStatus,
  onTogglePrivateNote
}: {
  report: ReportRow
  isAuthorized: boolean
  isUpdating: boolean
  error: string | null
  isPrivateNoteVisible: boolean
  canReviewReport: boolean
  onMatchInventory: () => void
  onUpdateStatus: (status: ReportStatus) => void
  onTogglePrivateNote: (visible: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Workspace Header */}
      <div style={workspaceHeaderStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={workspaceHeaderIconWrapperStyles}>
            <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={workspaceHeaderTitleStyles}>Report Workspace</h2>
              <span style={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Reference:</span>
              <span style={{ color: '#1E2F85', fontWeight: 800, letterSpacing: '-0.025em' }}>{report.code}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button variant="outline" style={workspaceActionBtnStyles}>
            <MessageSquare style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', color: '#1E2F85' }} /> Send Inquiry
          </Button>
          <Button
            disabled={!isAuthorized}
            onClick={onMatchInventory}
            style={matchInventoryBtnStyles(isAuthorized)}
          >
            <Link2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Match Inventory
          </Button>
        </div>
      </div>
      {isAuthorized && (
        <div style={authorizationNoticeStyles}>
          Report authorized. Next required step: match this report with found inventory.
        </div>
      )}

      {/* Workspace Content */}
      <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <div style={workspaceGridStyles}>
          {/* Left: Reported Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <DetailSection title="Reported Identity">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <DataRow label="Student Name" value={report.student} />
                  <DataRow label="Student Number" value={report.studentId} />
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9', width: '100%' }} />
                <DataRow label="Item Name / Description" value={report.item} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <DataRow label="Category" value={report.category} />
                  <DataRow label="Primary Color" value={report.color} />
                </div>
                <DataRow label="Brand / Model" value={report.brand} />
                <div style={{ height: '1px', backgroundColor: '#F1F5F9', width: '100%' }} />
                <DataRow label="Last Known Location" value={report.location} />
                <DataRow label="Estimated Time Window" value={report.timeWindow} />
                <DataRow label="Date of Loss" value={report.date} />
              </div>
            </DetailSection>

            {/* Conditional Proof Data */}
            <div style={proofDataContainerStyles}>
              <h5 style={proofBadgeStyles}>
                <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} />
                Conditional Proof Data
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {report.category === "Electronics" && report.deviceName && (
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', lineHeight: 1 }}>Device / Bluetooth Name</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>{report.deviceName}</div>
                  </div>
                )}
                {report.category === "Wallets/IDs" && report.nameOnDoc && (
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', lineHeight: 1 }}>Name on Document</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>{report.nameOnDoc}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', lineHeight: 1 }}>Marks / Stickers</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>{report.marks}</div>
                </div>
              </div>
            </div>

            {report.status === "MATCHED" && report.linkedItem && (
              <div style={linkedAssetContainerStyles}>
                <h5 style={{ fontSize: '10px', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Linked Asset</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <DataRow label="Inventory Code" value={report.linkedItem.code} />
                  <DataRow label="Matched Item" value={report.linkedItem.title} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <DataRow label="Category" value={report.linkedItem.category} />
                    <DataRow label="Color" value={report.linkedItem.color} />
                  </div>
                  <DataRow label="Storage Location" value={report.linkedItem.storageLocation} />
                </div>
              </div>
            )}
          </div>

          {/* Right: Security & Decisions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <DetailSection title="Privacy Guarded Data" icon={<ShieldAlert style={{ width: '1rem', height: '1rem', color: '#F43F5E' }} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={privacyDataWrapperStyles}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.75rem', fontFamily: 'monospace' }}>Student Private Note</label>
                  <div style={{
                    fontSize: '0.875rem',
                    transition: 'all 0.3s',
                    color: isPrivateNoteVisible ? '#334155' : '#CBD5E1',
                    filter: isPrivateNoteVisible ? 'none' : 'blur(8px)',
                    userSelect: isPrivateNoteVisible ? 'auto' : 'none',
                    pointerEvents: isPrivateNoteVisible ? 'auto' : 'none'
                  }}>
                    {report.privateNote}
                  </div>
                  {!isPrivateNoteVisible && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(2px)' }}>
                      <Button
                        size="sm"
                        onClick={() => onTogglePrivateNote(true)}
                        style={revealBtnStyles}
                      >
                        <Eye style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} /> Reveal Private Note
                      </Button>
                    </div>
                  )}
                  {isPrivateNoteVisible && (
                    <div style={{ marginTop: '1rem' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTogglePrivateNote(false)}
                        style={{ ...workspaceActionBtnStyles, height: '2rem' }}
                      >
                        <EyeOff style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} /> Hide Private Note
                      </Button>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #F1F5F9', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '1rem' }}>Reference Attachment</label>
                  <div style={attachmentPlaceholderStyles}>
                    <HelpCircle style={{ width: '2rem', height: '2rem', color: '#E2E8F0', marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>No media attached to report</span>
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Footer Decision Unit */}
            {canReviewReport ? (
              <div style={decisionFooterStyles}>
                <Button disabled={isUpdating} onClick={() => onUpdateStatus("REJECTED")} variant="outline" style={rejectBtnStyles}>
                  <XCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Reject Report
                </Button>
                <Button disabled={isUpdating} onClick={() => onUpdateStatus("ACTIVE_SEARCH")} style={authorizeBtnStyles}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Verify & Authorize
                </Button>
              </div>
            ) : (
              <div style={{ paddingTop: '2rem', borderTop: '1px solid #F1F5F9', borderRadius: '0.75rem', backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                Review decision is already recorded for this report. Continue with inventory matching or follow-up handling.
              </div>
            )}
            {error && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E11D48', margin: '0.5rem 0 0 0' }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
