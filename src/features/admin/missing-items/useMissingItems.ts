import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { formatShortDate } from "@/lib/formatters"
import { hasUnreadReportMessage, markReportMessagesViewed } from "@/lib/reportMessageReadState"
import { getRealtimeSocket } from "@/lib/realtime"
import { extractReportAttachmentUrls } from "@/features/reports/reportAttachments"
import type { ReportRow, ReportStatus } from "./types"

export function useMissingItems(focusCode: string) {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [revealedPrivateNotes, setRevealedPrivateNotes] = useState<Record<string, boolean>>({})
  const [showLinker, setShowLinker] = useState(false)
  const [chatReportId, setChatReportId] = useState<string | null>(null)
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false)
  const [isAuthorizeConfirmOpen, setIsAuthorizeConfirmOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [totalReports, setTotalReports] = useState(0)

  const report = reports.find((row) => row.id === selectedReport)
  const isPrivateNoteVisible = report ? Boolean(revealedPrivateNotes[report.id]) : false

  const loadReports = useCallback(async (silent = false): Promise<void> => {
    if (!silent) setIsLoading(true)

    setError(null)
    try {
      const pagedResponse = await api.get<{
        reports: ApiReportRow[]
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

      const mapped = pagedResponse.data.reports.map((entry) => mapReportRow(entry))

      setReports(mapped)
      setTotalReports(pagedResponse.data.pagination.total)
      setPageCount(pagedResponse.data.pagination.pageCount)
      setSelectedReport((prev) => {
        if (prev && mapped.some((row) => row.id === prev)) return prev
        return mapped[0]?.id ?? null
      })
    } catch {
      if (!silent) setError("Unable to load reports. Please refresh and try again.")
    } finally {
      if (!silent) setIsLoading(false)
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
    if (!socket) return

    const handleStatusUpdated = () => {
      void loadReports(true)
    }

    socket.on("report.status.updated", handleStatusUpdated)
    socket.on("report.message.created", handleStatusUpdated)

    return () => {
      socket.off("report.status.updated", handleStatusUpdated)
      socket.off("report.message.created", handleStatusUpdated)
    }
  }, [loadReports])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, rowsPerPage])

  useEffect(() => {
    if (!focusCode || reports.length === 0) return

    const matchedReport = reports.find((row) => row.code.toUpperCase() === focusCode)
    if (matchedReport) setSelectedReport(matchedReport.id)
  }, [focusCode, reports])

  const filteredReports = useMemo(
    () => reports.filter((row) => categoryMatchesFilter(row.category, categoryFilter)),
    [reports, categoryFilter]
  )

  const triageReports = useMemo(
    () => filteredReports.filter((row) => ["SUBMITTED", "UNDER_REVIEW", "ACTIVE_SEARCH"].includes(row.status)),
    [filteredReports]
  )

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

  async function rejectSelectedReport() {
    setIsRejectConfirmOpen(false)
    await updateReportStatus("REJECTED")
  }

  async function authorizeSelectedReport() {
    setIsAuthorizeConfirmOpen(false)
    await updateReportStatus("ACTIVE_SEARCH")
  }

  function markLinked(reportId: string) {
    setReports((prev) => prev.map((row) => (
      row.id === reportId ? { ...row, status: "MATCHED" } : row
    )))
  }

  function setPrivateNoteVisibility(reportId: string, visible: boolean) {
    setRevealedPrivateNotes((prev) => ({ ...prev, [reportId]: visible }))
  }

  function hasUnreadMessage(targetReport: ReportRow) {
    return hasUnreadReportMessage(targetReport.id, targetReport.latestMessage, "ADMIN")
  }

  function markMessagesViewed(reportId: string) {
    markReportMessagesViewed(reportId)
  }

  return {
    reports,
    triageReports,
    isLoading,
    isUpdating,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    selectedReport,
    setSelectedReport,
    report,
    isPrivateNoteVisible,
    showLinker,
    setShowLinker,
    chatReportId,
    setChatReportId,
    isRejectConfirmOpen,
    setIsRejectConfirmOpen,
    isAuthorizeConfirmOpen,
    setIsAuthorizeConfirmOpen,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    pageCount,
    totalReports,
    updateReportStatus,
    rejectSelectedReport,
    authorizeSelectedReport,
    markLinked,
    setPrivateNoteVisibility,
    loadReports,
    hasUnreadMessage,
    markMessagesViewed,
  }
}

type ApiReportRow = {
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
  messages?: Array<{
    sender: "STUDENT" | "STAFF" | "ADMIN"
    createdAt: string
  }>
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
}

function mapReportRow(entry: ApiReportRow): ReportRow {
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
    date: formatShortDate(entry.reportedLostAtUtc),
    location: entry.location,
    timeWindow: entry.timeWindow ?? "Not specified",
    status: entry.status,
    deviceName: typeof proof.deviceName === "string" ? proof.deviceName : undefined,
    nameOnDoc: typeof proof.nameOnDoc === "string" ? proof.nameOnDoc : undefined,
    marks: String(proof.marks ?? "Not provided"),
    privateNote: String(proof.privateNote ?? "Not provided"),
    attachmentUrls: extractReportAttachmentUrls(proof),
    latestMessage: entry.messages?.[0] ?? null,
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
}

function categoryMatchesFilter(category: string, categoryFilter: string): boolean {
  const normalizedRowCategory = category.toLowerCase()
  const normalizedFilterCategory = categoryFilter.toLowerCase()

  if (categoryFilter === "All") return true
  if (normalizedFilterCategory === "wallets/ids") {
    return normalizedRowCategory.includes("wallet") || normalizedRowCategory.includes("id")
  }
  if (normalizedFilterCategory === "everyday items") {
    return normalizedRowCategory.includes("everyday")
  }

  return normalizedRowCategory.includes(normalizedFilterCategory)
}
