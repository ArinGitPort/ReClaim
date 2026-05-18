import { useEffect, useMemo, useState } from "react"
import { AxiosError } from "axios"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { PickupRow } from "./types"

export function useReadyToClaim() {
  const [pickups, setPickups] = useState<PickupRow[]>([])
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [now, setNow] = useState(() => Date.now())

  async function loadPickups(): Promise<void> {
    const response = await api.get<{ pickups: PickupRow[] }>("/user/pickups")
    setPickups(response.data.pickups)
  }

  useEffect(() => {
    void loadPickups()
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(interval)
  }, [])

  const handleReroll = async (itemId: string) => {
    try {
      await api.post(`/user/pickups/${itemId}/reroll`)
      void loadPickups()
    } catch (error) {
      alert(readError(error, "Failed to regenerate token"))
    }
  }

  const filteredPickups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return pickups.filter((pickup) => {
      if (sourceFilter && pickup.source !== sourceFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = [pickup.sourceCode, pickup.itemTitle, pickup.pickupToken]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [pickups, search, sourceFilter])

  useEffect(() => {
    setPage(1)
  }, [search, sourceFilter, rowsPerPage])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredPickups.length / rowsPerPage)), [filteredPickups.length, rowsPerPage])

  const visiblePickups = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredPickups.slice(start, start + rowsPerPage)
  }, [filteredPickups, page, rowsPerPage])

  return {
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    now,
    filteredPickups,
    visiblePickups,
    pageCount,
    handleReroll,
  }
}

function readError(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? fallback
  }

  return fallback
}
