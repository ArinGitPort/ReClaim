import { useCallback, useEffect, useState } from "react"
import { ItemCard } from "@/features/gallery/ItemCard"
import type { FoundItem } from "@/features/gallery/ItemCard"
import { SearchX } from "lucide-react"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { useAuth } from "@/contexts/AuthContext"

export function GalleryGrid({
  page,
  pageSize,
  search,
  category,
  date,
  location,
  onDataChange,
}: {
  page: number
  pageSize: number
  search?: string
  category?: string
  date?: string
  location?: string
  onDataChange?: (payload: { visibleCount: number; totalCount: number; pageCount: number }) => void
}) {
  const [items, setItems] = useState<FoundItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [columns, setColumns] = useState(getColumns())
  const { user } = useAuth()
  const [activeClaimItemIds, setActiveClaimItemIds] = useState<Set<string>>(new Set())

  function getColumns() {
    if (typeof window === 'undefined') return 1
    if (window.innerWidth >= 1280) return 4
    if (window.innerWidth >= 768) return 3
    return 2
  }

  useEffect(() => {
    const handleResize = () => setColumns(getColumns())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
          isHighValue: boolean
          imageUrl?: string
          status: string
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
          search: search || undefined,
          category: category || undefined,
          date: date || undefined,
          location: location || undefined,
        },
      })

      const nextItems = pagedResponse.data.items.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        location: item.foundLocation,
        dateLost: item.foundAtUtc,
        isHighValue: item.isHighValue,
        imageUrl: item.imageUrl,
        status: item.status,
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
  }, [onDataChange, page, pageSize, search, category, date, location])

  useEffect(() => {
    if (!user) {
      setActiveClaimItemIds(new Set())
      return
    }

    const fetchClaims = async () => {
      try {
        const res = await api.get<{ claims: Array<{ foundItemId: string, status: string }> }>("/claims")
        const activeIds = new Set(
          res.data.claims
            .filter(c => c.status !== 'CANCELLED' && c.status !== 'DENIED')
            .map(c => c.foundItemId)
        )
        setActiveClaimItemIds(activeIds)
      } catch (err) {
        console.error("Failed to fetch user claims", err)
      }
    }

    void fetchClaims()
  }, [user])

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
    <div style={{
      columnCount: columns,
      columnGap: '16px',
      width: '100%',
      margin: '0 auto'
    }}>      
      {items.map(item => (
        <ItemCard key={item.id} item={item} hasActiveClaim={activeClaimItemIds.has(item.id)} />
      ))}
    </div>
  )
}
