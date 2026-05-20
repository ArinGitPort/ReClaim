import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { hasUnreadClaimMessage, markClaimMessagesViewed } from "@/lib/claimMessageReadState"
import { getRealtimeSocket } from "@/lib/realtime"
import { getImageUrl } from "@/lib/utils"
import { formatClaimStatus, isClosableClaimStatus } from "./claimStatus"
import type { ClaimView } from "./types"

export function useMyClaims() {
  const [claims, setClaims] = useState<ClaimView[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ACTIVE")
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null)
  const [closeConfirmClaim, setCloseConfirmClaim] = useState<ClaimView | null>(null)
  const [chatTicketId, setChatTicketId] = useState<string | null>(null)
  const [rerollingItemId, setRerollingItemId] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [now, setNow] = useState(() => Date.now())
  const [, setMessageReadVersion] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  const loadClaims = useCallback(async (): Promise<void> => {
    const response = await api.get<{ claims: ApiClaim[] }>("/claims", {
      params: {
        statusIn: "PENDING_VERIFICATION,INQUIRY_REQUIRED,APPROVED,DENIED,CANCELLED,EXPIRED",
      },
    })

    setClaims(response.data.claims.map(mapClaimView).sort(sortClaimViews))
  }, [])

  useEffect(() => {
    void loadClaims()
  }, [loadClaims])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) return

    const handleClaimUpdated = () => {
      void loadClaims()
    }
    const handleClaimMessage = () => {
      setMessageReadVersion((version) => version + 1)
      void loadClaims()
    }

    socket.on("claim.status.updated", handleClaimUpdated)
    socket.on("claim.message.created", handleClaimMessage)
    return () => {
      socket.off("claim.status.updated", handleClaimUpdated)
      socket.off("claim.message.created", handleClaimMessage)
    }
  }, [loadClaims])

  const filteredClaims = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return claims.filter((claim) => {
      if (statusFilter === "ACTIVE") {
        const isActive = claim.rawStatus === "PENDING_VERIFICATION" ||
          claim.rawStatus === "INQUIRY_REQUIRED" ||
          (claim.rawStatus === "APPROVED" && claim.itemStatus !== "RETURNED")
        if (!isActive) return false
      } else if (statusFilter && claim.status !== statusFilter) {
        return false
      }

      if (!normalizedSearch) return true

      return [claim.item, claim.category, claim.location].join(" ").toLowerCase().includes(normalizedSearch)
    })
  }, [claims, search, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, rowsPerPage])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredClaims.length / rowsPerPage)), [filteredClaims.length, rowsPerPage])
  const visibleClaims = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredClaims.slice(start, start + rowsPerPage)
  }, [filteredClaims, page, rowsPerPage])

  async function closeTicket(claim: ClaimView): Promise<void> {
    if (!isClosableClaimStatus(claim.rawStatus)) return

    setClosingTicketId(claim.ticketId)
    try {
      await api.patch(`/claims/${claim.ticketId}/close`)
      await loadClaims()
    } finally {
      setClosingTicketId(null)
      setCloseConfirmClaim(null)
    }
  }

  async function rerollToken(itemId: string): Promise<void> {
    setRerollingItemId(itemId)
    try {
      await api.post(`/user/pickups/${itemId}/reroll`)
      await loadClaims()
    } finally {
      setRerollingItemId(null)
    }
  }

  function hasUnreadMessage(claim: ClaimView) {
    return hasUnreadClaimMessage(claim.ticketId, claim.latestMessage, "STUDENT")
  }

  function markMessagesViewed(claimId: string) {
    markClaimMessagesViewed(claimId)
    setMessageReadVersion((version) => version + 1)
  }

  const statusOptions = useMemo(() => {
    const orderedStatuses = [
      { label: "Active", value: "ACTIVE" },
      { label: "Pending Verification", value: "Pending Verification" },
      { label: "Approved", value: "Approved" },
      { label: "Completed", value: "Completed" },
      { label: "Denied", value: "Denied" },
      { label: "Cancelled", value: "Cancelled" },
      { label: "Expired", value: "Expired" },
    ]
    const availableStatuses = new Set(claims.map((claim) => claim.status))
    return orderedStatuses.filter((option) => option.value === "ACTIVE" || availableStatuses.has(option.value))
  }, [claims])

  return {
    claims,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    closingTicketId,
    closeConfirmClaim,
    setCloseConfirmClaim,
    chatTicketId,
    setChatTicketId,
    rerollingItemId,
    previewImageUrl,
    setPreviewImageUrl,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    now,
    filteredClaims,
    visibleClaims,
    pageCount,
    statusOptions,
    loadClaims,
    closeTicket,
    rerollToken,
    hasUnreadMessage,
    markMessagesViewed,
  }
}

type ApiClaim = {
  id: string
  claimCode: string
  status: string
  createdAt: string
  reviewerNote?: string | null
  messages?: Array<{
    sender: "STUDENT" | "STAFF" | "ADMIN"
    createdAt: string
  }>
  reservationExpiresAt?: string | null
  pickupToken?: string | null
  pickupTokenExpires?: string | null
  foundItem: {
    id: string
    code: string
    title: string
    category: string
    foundLocation: string
    status: string
    imageUrl?: string | null
  }
}

function mapClaimView(claim: ApiClaim): ClaimView {
  return {
    ticketId: claim.id,
    id: claim.claimCode,
    itemId: claim.foundItem.id,
    item: claim.foundItem.title,
    imageUrl: getImageUrl(claim.foundItem.imageUrl),
    category: claim.foundItem.category,
    location: claim.foundItem.foundLocation,
    submittedDate: new Date(claim.createdAt).toLocaleDateString(),
    submittedAtRaw: claim.createdAt,
    rawStatus: claim.status,
    status: formatClaimStatus(claim.status, claim.foundItem.status),
    reviewerNote: claim.reviewerNote,
    reservationExpiresAt: claim.reservationExpiresAt ?? null,
    pickupToken: claim.pickupToken ?? null,
    pickupTokenExpires: claim.pickupTokenExpires ?? null,
    itemStatus: claim.foundItem.status,
    latestMessage: claim.messages?.[0] ?? null,
  }
}

function sortClaimViews(a: ClaimView, b: ClaimView): number {
  const rank = (claim: ClaimView): number => {
    if (claim.rawStatus === "APPROVED" && claim.itemStatus === "RETURNED") return 7

    const order: Record<string, number> = {
      INQUIRY_REQUIRED: 1,
      PENDING_VERIFICATION: 2,
      APPROVED: 3,
      DENIED: 4,
      CANCELLED: 5,
      EXPIRED: 6,
    }
    return order[claim.rawStatus] || 99
  }

  const rankA = rank(a)
  const rankB = rank(b)

  if (rankA !== rankB) return rankA - rankB
  return new Date(b.submittedAtRaw).getTime() - new Date(a.submittedAtRaw).getTime()
}
