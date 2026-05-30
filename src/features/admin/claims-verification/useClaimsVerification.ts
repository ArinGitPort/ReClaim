import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { getRealtimeSocket } from "@/lib/realtime"
import { notify } from "@/lib/notify"
import { hasUnreadClaimMessage, markClaimMessagesViewed } from "@/lib/claimMessageReadState"
import { fallbackSettings } from "@/features/admin/settings/settingsConfig"
import type { SettingsResponse } from "@/features/admin/settings/types"
import type { ClaimDecision, ClaimRow } from "./types"

export function useClaimsVerification(focusCode: string, queryStatus: string | null) {
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [totalClaims, setTotalClaims] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [denialNote, setDenialNote] = useState("")
  const [alertTemplates, setAlertTemplates] = useState(fallbackSettings.alertTemplates)
  const [error, setError] = useState<string | null>(null)
  const [pendingDecision, setPendingDecision] = useState<ClaimDecision | null>(null)
  const [, setMessageReadVersion] = useState(0)
  const debouncedSearch = useDebounce(search, 350)
  const debouncedStatus = useDebounce(statusFilter, 350)
  const [lastFocusCode, setLastFocusCode] = useState("")

  useEffect(() => {
    if (!focusCode || claims.length === 0) return
    if (focusCode === lastFocusCode) return

    const matchedClaim = claims.find((row) => row.claimCode.toUpperCase() === focusCode)
    if (matchedClaim) {
      setSelectedClaimId(matchedClaim.id)
      setLastFocusCode(focusCode)
    }
  }, [focusCode, claims, lastFocusCode])

  useEffect(() => {
    if (queryStatus === "PENDING_VERIFICATION" || queryStatus === "INQUIRY_REQUIRED") {
      setStatusFilter(queryStatus)
    }
  }, [queryStatus])

  const loadClaims = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{
        claims: ClaimRow[]
        pagination?: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/claims", {
        params: {
          statusIn: "PENDING_VERIFICATION,INQUIRY_REQUIRED",
          status: debouncedStatus || undefined,
          search: debouncedSearch.trim() || undefined,
          page,
          limit: rowsPerPage,
        },
      })

      setClaims(response.data.claims)
      setTotalClaims(response.data.pagination?.total ?? response.data.claims.length)
      setPageCount(response.data.pagination?.pageCount ?? 1)
      setSelectedClaimId((previous) => {
        if (previous && response.data.claims.some((claim) => claim.id === previous)) return previous
        return response.data.claims[0]?.id ?? null
      })
    } catch {
      setError("Unable to load claims queue.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, debouncedStatus, focusCode, page, rowsPerPage])

  useEffect(() => {
    void loadClaims()
  }, [loadClaims])

  useEffect(() => {
    async function loadAlertTemplates() {
      try {
        const response = await api.get<SettingsResponse>("/settings")
        setAlertTemplates(response.data.settings.alertTemplates)
      } catch {
        setAlertTemplates(fallbackSettings.alertTemplates)
      }
    }

    void loadAlertTemplates()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, rowsPerPage])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) return

    const refreshMessageIndicators = () => {
      setMessageReadVersion((version) => version + 1)
      void loadClaims()
    }

    const handleClaimUpdated = () => {
      void loadClaims()
    }

    socket.on("claim.status.updated", handleClaimUpdated)
    socket.on("claim.message.created", refreshMessageIndicators)
    return () => {
      socket.off("claim.status.updated", handleClaimUpdated)
      socket.off("claim.message.created", refreshMessageIndicators)
    }
  }, [loadClaims])

  const filteredClaims = useMemo(() => claims, [claims])
  const selectedClaim = useMemo(
    () => filteredClaims.find((claim) => claim.id === selectedClaimId) ?? claims.find((claim) => claim.id === selectedClaimId) ?? null,
    [claims, filteredClaims, selectedClaimId]
  )
  const selectedClaimHasUnreadMessage = selectedClaim
    ? hasUnreadClaimMessage(selectedClaim.id, selectedClaim.messages?.[0], "ADMIN")
    : false

  useEffect(() => {
    if (!selectedClaimId && filteredClaims.length > 0) {
      setSelectedClaimId(filteredClaims[0].id)
    }
  }, [filteredClaims, selectedClaimId])

  async function decide(status: ClaimDecision, reviewerNote?: string): Promise<boolean> {
    if (!selectedClaim) return false

    const trimmedReviewerNote = reviewerNote?.trim()
    if (status === "DENIED" && !trimmedReviewerNote) {
      notify.error("Reviewer note required", "Add a reason before denying this claim.")
      return false
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await api.patch(`/claims/${selectedClaim.id}/decision`, {
        status,
        reviewerNote: trimmedReviewerNote || undefined,
      })
      await loadClaims()
      return true
    } catch {
      setError("Failed to update claim decision.")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const decisionConfig = useMemo(() => {
    if (!pendingDecision || !selectedClaim) return null

    const subject = selectedClaim.foundItem.title

    switch (pendingDecision) {
      case "APPROVED":
        return {
          title: "Approve Claim",
          message: `Approve claim ${selectedClaim.claimCode} for ${subject}? This will authorize pickup.`,
          confirmText: "Approve",
          isDestructive: false,
        }
      case "DENIED":
        return {
          title: "Deny Claim",
          message: `Deny claim ${selectedClaim.claimCode} for ${subject}? This cannot be undone.`,
          confirmText: "Deny",
          isDestructive: true,
        }
    }
  }, [pendingDecision, selectedClaim])

  function requestDecision(status: ClaimDecision) {
    if (status === "DENIED") {
      setDenialNote(selectedClaim?.reviewerNote?.trim() || alertTemplates.claimDenied)
    }

    setPendingDecision(status)
  }

  async function confirmDecision() {
    if (!pendingDecision) return

    const reviewerNote = pendingDecision === "DENIED" ? denialNote : undefined
    const succeeded = await decide(pendingDecision, reviewerNote)
    if (succeeded) {
      setPendingDecision(null)
      setDenialNote("")
    }
  }

  function markSelectedClaimMessagesViewed() {
    if (!selectedClaim) return
    markClaimMessagesViewed(selectedClaim.id)
    setMessageReadVersion((version) => version + 1)
  }

  function claimHasUnreadMessage(claim: ClaimRow) {
    return hasUnreadClaimMessage(claim.id, claim.messages?.[0], "ADMIN")
  }

  return {
    claims,
    filteredClaims,
    totalClaims,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    pageCount,
    selectedClaimId,
    setSelectedClaimId,
    selectedClaim,
    selectedClaimHasUnreadMessage,
    claimHasUnreadMessage,
    isLoading,
    isSubmitting,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    denialNote,
    setDenialNote,
    markSelectedClaimMessagesViewed,
    error,
    pendingDecision,
    setPendingDecision,
    decisionConfig,
    requestDecision,
    confirmDecision,
  }
}
