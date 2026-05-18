import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { ExpiredItem } from "./types"

export function useExpiredInventory() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const [items, setItems] = useState<ExpiredItem[]>([])
  const [loading, setLoading] = useState(true)
  const [retentionDays, setRetentionDays] = useState(30)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDisposing, setIsDisposing] = useState(false)
  const [showDisposeConfirm, setShowDisposeConfirm] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 400)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const [res, settingsRes] = await Promise.all([
        api.get("/items/admin", { params: { expired: true, search: debouncedSearch || undefined } }),
        api.get<{ settings: { retentionPolicy: { foundItemRetentionDays: number } } }>("/settings"),
      ])
      setItems(res.data.items || [])
      setRetentionDays(settingsRes.data.settings.retentionPolicy.foundItemRetentionDays)
    } catch (err) {
      console.error("Failed to load expired items", err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)))
    }
  }

  const handleBatchDispose = async () => {
    if (selectedIds.size === 0) return

    try {
      setIsDisposing(true)
      await api.post("/items/batch-dispose", { itemIds: Array.from(selectedIds) })
      setSelectedIds(new Set())
      setShowDisposeConfirm(false)
      void fetchItems()
    } catch (err) {
      console.error("Failed to dispose items", err)
      alert("Failed to dispose items")
    } finally {
      setIsDisposing(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
  }

  return {
    focusCode,
    items,
    loading,
    retentionDays,
    searchQuery,
    setSearchQuery,
    selectedIds,
    isDisposing,
    showDisposeConfirm,
    setShowDisposeConfirm,
    toggleSelect,
    toggleSelectAll,
    handleBatchDispose,
    resetFilters,
  }
}
