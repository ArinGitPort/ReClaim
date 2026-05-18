import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { DeletedItem } from "./types"

export function useDeletedItems() {
  const [items, setItems] = useState<DeletedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 350)

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get<{ items: DeletedItem[] }>("/items/admin", {
        params: {
          status: "ARCHIVED",
          search: debouncedSearch.trim() || undefined,
          limit: 100,
        },
      })
      setItems(response.data.items)
    } catch {
      alert("Failed to load deleted items.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  async function restoreItem(itemId: string) {
    setRestoringId(itemId)
    try {
      await api.patch(`/items/${itemId}`, { status: "AVAILABLE" })
      await loadItems()
    } catch {
      alert("Failed to restore item.")
    } finally {
      setRestoringId(null)
    }
  }

  return {
    items,
    isLoading,
    search,
    setSearch,
    restoringId,
    restoreItem,
    loadItems,
  }
}
