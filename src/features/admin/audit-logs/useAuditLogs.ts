import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { AuditAction, AuditLogRow } from "./types"

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("")
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedAction = useDebounce(actionFilter, 300)

  useEffect(() => {
    let cancelled = false

    async function loadLogs() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await api.get<{
          logs: AuditLogRow[]
          pagination: {
            page: number
            limit: number
            total: number
            pageCount: number
          }
        }>("/audit/logs", {
          params: {
            search: debouncedSearch.trim() || undefined,
            action: debouncedAction || undefined,
            page,
            limit: rowsPerPage,
          },
        })

        if (cancelled) return
        setLogs(response.data.logs)
        setTotal(response.data.pagination.total)
        setPageCount(response.data.pagination.pageCount)
      } catch {
        if (!cancelled) setError("Unable to load audit records.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadLogs()

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, debouncedAction, page, rowsPerPage])

  const resultLabel = useMemo(() => {
    return `Showing ${logs.length} of ${total} log${total === 1 ? "" : "s"}`
  }, [logs.length, total])

  const resetFilters = () => {
    setSearchQuery("")
    setActionFilter("")
    setPage(1)
  }

  return {
    logs,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    selectedLog,
    setSelectedLog,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    pageCount,
    total,
    resultLabel,
    resetFilters,
  }
}
