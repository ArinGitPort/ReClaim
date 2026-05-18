import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { getRealtimeSocket } from "@/lib/realtime"
import { mapInventoryRow, type ApiInventoryItem } from "./inventoryUtils"
import type { InventoryRow } from "./types"

export function useInventory(queryStatus: string | null) {
  const [inventoryItems, setInventoryItems] = useState<InventoryRow[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showFastEntry, setShowFastEntry] = useState(false)
  const [editItem, setEditItem] = useState<InventoryRow | null>(null)
  const [detailsItem, setDetailsItem] = useState<InventoryRow | null>(null)
  const [handoverItem, setHandoverItem] = useState<InventoryRow | null>(null)
  const debouncedSearch = useDebounce(search, 350)
  const debouncedStatus = useDebounce(statusFilter, 350)
  const debouncedCategory = useDebounce(categoryFilter, 350)

  useEffect(() => {
    if (queryStatus === "AVAILABLE" || queryStatus === "CLAIM_PENDING" || queryStatus === "ARCHIVED") {
      setStatusFilter(queryStatus)
    }
  }, [queryStatus])

  const loadItems = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{
        items: ApiInventoryItem[]
        pagination?: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/items/admin", {
        params: {
          search: debouncedSearch.trim() || undefined,
          status: debouncedStatus || undefined,
          category: debouncedCategory || undefined,
          page,
          limit: rowsPerPage,
        },
      })

      setInventoryItems(response.data.items.map((item) => mapInventoryRow(item)))
      setTotalItems(response.data.pagination?.total ?? response.data.items.length)
      setPageCount(response.data.pagination?.pageCount ?? 1)
      const serverPage = response.data.pagination?.page ?? page
      if (serverPage !== page) setPage(serverPage)
    } catch {
      setError("Unable to load inventory records.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedCategory, debouncedSearch, debouncedStatus, page, rowsPerPage])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, categoryFilter, rowsPerPage])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) return

    const handleItemUpdated = () => {
      void loadItems()
    }

    socket.on("item.updated", handleItemUpdated)
    return () => {
      socket.off("item.updated", handleItemUpdated)
    }
  }, [loadItems])

  const statusOptions = useMemo(() => ["AVAILABLE", "CLAIM_PENDING", "ARCHIVED"], [])
  const visibleItems = useMemo(() => inventoryItems.filter((item) => item.status !== "RETURNED"), [inventoryItems])

  function resetFilters() {
    setStatusFilter("")
    setCategoryFilter("")
    setSearch("")
    setPage(1)
  }

  return {
    inventoryItems,
    visibleItems,
    totalItems,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    pageCount,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    statusOptions,
    showFastEntry,
    setShowFastEntry,
    editItem,
    setEditItem,
    detailsItem,
    setDetailsItem,
    handoverItem,
    setHandoverItem,
    loadItems,
    resetFilters,
  }
}
