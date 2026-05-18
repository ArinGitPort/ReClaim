import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { HandoverLogRow } from "./types"

export function useHandoverLog() {
  const [logs, setLogs] = useState<HandoverLogRow[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [logsSearch, setLogsSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [selectedLog, setSelectedLog] = useState<HandoverLogRow | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [restoreLogId, setRestoreLogId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(logsSearch, 250)
  const debouncedSource = useDebounce(sourceFilter, 250)

  const sourceOptions = useMemo(
    () => [
      { label: "Manual Claim", value: "CLAIM" },
      { label: "Report Match", value: "REPORT_MATCH" },
    ],
    []
  )

  useEffect(() => {
    void loadHandoverLogs({
      search: debouncedSearch.trim() || undefined,
      source: debouncedSource || undefined,
      page,
      limit: rowsPerPage,
    })
  }, [debouncedSearch, debouncedSource, page, rowsPerPage])

  useEffect(() => {
    setPage(1)
  }, [logsSearch, sourceFilter, rowsPerPage])

  async function loadHandoverLogs(input: { search?: string; source?: string; page: number; limit: number }): Promise<void> {
    setIsLoadingLogs(true)
    try {
      const response = await api.get<{
        handovers: HandoverLogRow[]
        pagination: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/handover/logs", {
        params: input,
      })

      setLogs(response.data.handovers)
      setTotal(response.data.pagination.total)
      setPageCount(response.data.pagination.pageCount)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  async function restoreHandover(id: string): Promise<void> {
    setIsRestoring(true)
    try {
      await api.post(`/handover/${id}/restore`)
      setSelectedLog(null)
      await loadHandoverLogs({
        search: debouncedSearch.trim() || undefined,
        source: debouncedSource || undefined,
        page,
        limit: rowsPerPage,
      })
    } catch (err) {
      console.error(err)
      alert("Failed to restore handover.")
    } finally {
      setIsRestoring(false)
    }
  }

  const resultLabel = useMemo(() => {
    return `Showing ${logs.length} of ${total} result${total === 1 ? "" : "s"}`
  }, [logs.length, total])

  function resetFilters() {
    setLogsSearch("")
    setSourceFilter("")
    setPage(1)
  }

  return {
    logs,
    isLoadingLogs,
    logsSearch,
    setLogsSearch,
    sourceFilter,
    setSourceFilter,
    selectedLog,
    setSelectedLog,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    pageCount,
    total,
    isRestoring,
    showRestoreConfirm,
    setShowRestoreConfirm,
    restoreLogId,
    setRestoreLogId,
    sourceOptions,
    resultLabel,
    resetFilters,
    restoreHandover,
  }
}
