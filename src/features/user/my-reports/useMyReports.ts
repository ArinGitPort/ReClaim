import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { hasUnreadReportMessage, markReportMessagesViewed } from "@/lib/reportMessageReadState"
import { getRealtimeSocket } from "@/lib/realtime"
import { extractReportAttachmentUrls } from "@/features/reports/reportAttachments"
import { isClosableReportStatus, toStudentStatusLabel } from "./reportStatus"
import type { ReportRealtimeEvent, ReportView } from "./types"

export function useMyReports() {
  const [reports, setReports] = useState<ReportView[]>([])
  const [liveNotice, setLiveNotice] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null)
  const [closeConfirmReport, setCloseConfirmReport] = useState<ReportView | null>(null)
  const [chatReportId, setChatReportId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [, setMessageReadVersion] = useState(0)

  const loadReports = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<{ reports: ApiReport[] }>("/reports", {
        params: { statusIn: "UNDER_REVIEW,ACTIVE_SEARCH,MATCHED,RESOLVED" },
      })

      setReports(response.data.reports.map(mapReportView).sort(sortReportViews))
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
      if (document.visibilityState === "visible") void loadReports()
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [loadReports])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) return

    const handleStatusUpdated = (event: ReportRealtimeEvent) => {
      if (event.status === "MATCHED") {
        setLiveNotice(`Good news! ${event.reportCode} has a match. Use Ready to Claim to view your pickup token.`)
      }
      void loadReports()
    }

    socket.on("report.status.updated", handleStatusUpdated)
    socket.on("report.message.created", loadReports)

    return () => {
      socket.off("report.status.updated", handleStatusUpdated)
      socket.off("report.message.created", loadReports)
    }
  }, [loadReports])

  async function closeTicket(report: ReportView): Promise<void> {
    if (!isClosableReportStatus(report.rawStatus)) return

    setClosingTicketId(report.ticketId)
    try {
      await api.patch(`/reports/${report.ticketId}/close`)
      await loadReports()
    } finally {
      setClosingTicketId(null)
      setCloseConfirmReport(null)
    }
  }

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return reports.filter((report) => {
      if (statusFilter && report.status !== statusFilter) return false
      if (!normalizedSearch) return true

      return [report.id, report.item, report.category, report.color, report.location]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
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
    return Array.from(new Set(reports.map((report) => report.status))).map((status) => ({ label: status, value: status }))
  }, [reports])

  function hasUnreadMessage(report: ReportView) {
    return hasUnreadReportMessage(report.ticketId, report.latestMessage, "STUDENT")
  }

  function markMessagesViewed(reportId: string) {
    markReportMessagesViewed(reportId)
    setMessageReadVersion((version) => version + 1)
  }

  return {
    liveNotice,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    closingTicketId,
    closeConfirmReport,
    setCloseConfirmReport,
    chatReportId,
    setChatReportId,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filteredReports,
    visibleReports,
    pageCount,
    statusOptions,
    loadReports,
    closeTicket,
    hasUnreadMessage,
    markMessagesViewed,
  }
}

type ApiReport = {
  id: string
  reportCode: string
  title: string
  category: string
  color: string
  location: string
  reportedLostAtUtc: string
  timeWindow?: string
  proofData?: Record<string, unknown>
  messages?: Array<{
    sender: "STUDENT" | "STAFF" | "ADMIN"
    createdAt: string
  }>
  createdAt: string
  status: string
  matchedItem?: {
    claims?: Array<{
      pickupToken: string | null
      pickupTokenExpires: string | null
      claimantUserId: string
    }>
  } | null
}

function mapReportView(report: ApiReport): ReportView {
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
    attachmentUrls: extractReportAttachmentUrls(proof),
    rawStatus: report.status,
    status: toStudentStatusLabel(report.status),
    pickupToken: matchedClaim?.pickupToken ?? null,
    pickupTokenExpires: matchedClaim?.pickupTokenExpires ?? null,
    latestMessage: report.messages?.[0] ?? null,
  }
}

function sortReportViews(a: ReportView, b: ReportView): number {
  const order: Record<string, number> = { MATCHED: 1, ACTIVE_SEARCH: 2, UNDER_REVIEW: 3, RESOLVED: 4 }
  const rankA = order[a.rawStatus] || 99
  const rankB = order[b.rawStatus] || 99
  if (rankA !== rankB) return rankA - rankB
  return new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime()
}
