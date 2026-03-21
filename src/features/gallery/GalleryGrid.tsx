import { useCallback, useEffect, useState } from "react"
import { ItemCard } from "@/features/gallery/ItemCard"
import type { FoundItem } from "@/features/gallery/ItemCard"
import { SearchX } from "lucide-react"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"

export function GalleryGrid({
  page,
  pageSize,
  filters,
  onDataChange,
}: {
  page: number
  pageSize: number
  filters?: {
    search: string;
    dateLost: string;
    categories: string[];
    location: string;
  }
  onDataChange?: (payload: { visibleCount: number; totalCount: number; pageCount: number }) => void 
}) {
  const [items, setItems] = useState<FoundItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadItems = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      const pagedResponse = await api.get<{
        items: Array<{
          id: string
          code: string
          title: string
          category: string
          foundLocation: string
          foundAtUtc: string
        }>
        pagination: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/items/public", {
        params: {
          page,
          limit: pageSize,
          search: filters?.search,
          categories: filters?.categories.join(','),
          dateLost: filters?.dateLost,
          location: filters?.location,
        },
      })

      const nextItems = pagedResponse.data.items.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        location: item.foundLocation,
        dateLost: item.foundAtUtc,
        isHighValue: ["electronics", "wallets/ids"].includes(item.category.toLowerCase()),
      }))

      setItems(nextItems)
      onDataChange?.({
        visibleCount: nextItems.length,
        totalCount: pagedResponse.data.pagination.total,
        pageCount: pagedResponse.data.pagination.pageCount,
      })
    } finally {
      setIsLoading(false)
    }
  }, [onDataChange, page, pageSize, filters])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) {
      return
    }

    const handleItemUpdated = () => {
      void loadItems()
    }

    socket.on("item.updated", handleItemUpdated)
    return () => {
      socket.off("item.updated", handleItemUpdated)
    }
  }, [loadItems])

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-semibold">Loading items...</div>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 lg:p-24 border-2 border-dashed border-border-divider/50 rounded-xl bg-background-subtle/30">
        <SearchX className="w-12 h-12 text-text-secondary mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-text-primary mb-2">No items found</h3>
        <p className="text-text-secondary text-center max-w-sm">
          We couldn't find any items matching your current filters. Try adjusting your search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
