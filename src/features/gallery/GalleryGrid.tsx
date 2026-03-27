import { useCallback, useEffect, useState } from "react"
import { ItemCard } from "@/features/gallery/ItemCard"
import type { FoundItem } from "@/features/gallery/ItemCard"
import { SearchX } from "lucide-react"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { useIsMobile } from "@/hooks/useIsMobile"

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
  const isMobile = useIsMobile()

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
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>Loading items...</div>
  }

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '3rem 1.5rem' : '6rem', border: '2px dashed rgba(226, 232, 240, 0.5)', borderRadius: '0.75rem', backgroundColor: 'rgba(241, 245, 249, 0.3)' }}>
        <SearchX style={{ width: '3rem', height: '3rem', color: '#64748B', marginBottom: '1rem', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0F172A', marginBottom: '0.5rem', marginTop: 0 }}>No items found</h3>
        <p style={{ color: '#64748B', textAlign: 'center', maxWidth: '24rem', margin: 0 }}>
          We couldn't find any items matching your current filters. Try adjusting your search criteria.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: isMobile ? '1rem' : '1.5rem' }}>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
