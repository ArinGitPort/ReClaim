import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { formatShortDate } from "@/lib/formatters"
import { getRealtimeSocket } from "@/lib/realtime"
import type { ReportRow, ReportStatus } from "@/features/admin/missing-items/types"
import { toast } from "sonner"

export function useMatchHistory() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [totalReports, setTotalReports] = useState(0)

  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [unlinkReportId, setUnlinkReportId] = useState<string | null>(null)

  const loadReports = useCallback(async (silent = false): Promise<void> => {
    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const pagedResponse = await api.get<{
        reports: any[]
        pagination: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/reports", {
        params: {
          statusIn: "MATCHED",
          search: searchQuery.trim() || undefined,
          category: categoryFilter || undefined,
          page,
          limit: rowsPerPage,
        },
      })

      const mapped = pagedResponse.data.reports.map((entry) => ({
        id: entry.id,
        code: entry.reportCode,
        student: entry.reporterUser?.name ?? "Unknown Student",
        studentId: entry.reporterUser?.studentId ?? "N/A",
        item: entry.title,
        category: entry.category,
        color: entry.color,
        date: formatShortDate(entry.reportedLostAtUtc),
        status: entry.status as ReportStatus,
        linkedItem: entry.matchedItem
          ? {
              id: entry.matchedItem.id,
              code: entry.matchedItem.code,
              title: entry.matchedItem.title,
              category: entry.matchedItem.category,
              color: entry.matchedItem.color,
              status: entry.matchedItem.status,
            }
          : undefined,
      })) as ReportRow[]

      setReports(mapped)
      setTotalReports(pagedResponse.data.pagination.total)
      setPageCount(pagedResponse.data.pagination.pageCount)
    } catch {
      if (!silent) setError("Unable to load matched reports.")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [page, rowsPerPage, searchQuery])

  useEffect(() => {
    void loadReports()

    const intervalId = window.setInterval(() => {
      void loadReports(true)
    }, 10000)

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

    return () => {
      socket.off("report.status.updated", handleStatusUpdated)
    }
  }, [loadReports])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, categoryFilter, rowsPerPage])

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("")
    setPage(1)
  }

  async function revertMatch(reportId: string): Promise<void> {
    setIsUpdating(true)
    try {
      await api.patch(`/reports/${reportId}`, {
        status: "ACTIVE_SEARCH",
        matchedItemId: null,
      })
      toast.success("Match reverted", { description: "Report returned to active queue." })
      await loadReports(true)
    } catch {
      toast.error("Failed to revert match")
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    reports,
    isLoading,
    isUpdating,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    resetFilters,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    pageCount,
    totalReports,
    selectedReport,
    setSelectedReport,
    showUnlinkConfirm,
    setShowUnlinkConfirm,
    unlinkReportId,
    setUnlinkReportId,
    revertMatch,
    loadReports
  }
}
