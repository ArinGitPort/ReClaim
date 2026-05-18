import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { filterSnapshots, getSnapshotLocation } from "./snapshotUtils"
import type { AISnapshot, ConfidenceFilter } from "./types"

type UseSnapshotCollectionOptions = {
  endpoint: string
  initialRowsPerPage?: number
  onLoadError?: string
}

export function useSnapshotCollection({
  endpoint,
  initialRowsPerPage = 10,
  onLoadError,
}: UseSnapshotCollectionOptions) {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)
  const [snapshots, setSnapshots] = useState<AISnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSnapshot, setSelectedSnapshot] = useState<AISnapshot | null>(null)

  const loadSnapshots = useCallback(async () => {
    try {
      const response = await api.get<{ snapshots: AISnapshot[] }>(endpoint)
      setSnapshots(response.data.snapshots)
    } catch {
      if (onLoadError) alert(onLoadError)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, onLoadError])

  useEffect(() => {
    void loadSnapshots()
  }, [loadSnapshots])

  const filteredSnapshots = useMemo(
    () => filterSnapshots(snapshots, searchQuery, locationFilter, confidenceFilter),
    [snapshots, searchQuery, locationFilter, confidenceFilter],
  )

  const uniqueLocations = useMemo(
    () => Array.from(new Set(snapshots.map(getSnapshotLocation))),
    [snapshots],
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery, locationFilter, confidenceFilter, rowsPerPage])

  const pageCount = Math.max(1, Math.ceil(filteredSnapshots.length / rowsPerPage))
  const paginatedSnapshots = filteredSnapshots.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const resetFilters = () => {
    setSearchQuery("")
    setLocationFilter("")
    setConfidenceFilter("")
    setPage(1)
  }

  const removeSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((snapshot) => snapshot.id !== id))
  }

  return {
    searchQuery,
    setSearchQuery,
    locationFilter,
    setLocationFilter,
    confidenceFilter,
    setConfidenceFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    snapshots,
    setSnapshots,
    isLoading,
    selectedSnapshot,
    setSelectedSnapshot,
    filteredSnapshots,
    paginatedSnapshots,
    uniqueLocations,
    pageCount,
    resetFilters,
    removeSnapshot,
    hasActiveFilters: Boolean(searchQuery || locationFilter || confidenceFilter),
  }
}
