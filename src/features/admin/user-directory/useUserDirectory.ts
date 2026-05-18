import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { ActiveModalState, UserDirectoryDetails, UserDirUser } from "@/features/admin/types"

export type UserSortField = "name" | "createdAt"

export function useUserDirectory() {
  const [users, setUsers] = useState<UserDirUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [pageCount, setPageCount] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [sortField] = useState<UserSortField>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedUser, setSelectedUser] = useState<UserDirUser | null>(null)
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDirectoryDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<ActiveModalState>(null)
  const selectedUserId = selectedUser?.id
  const debouncedSearch = useDebounce(searchQuery, 400)
  const debouncedRole = useDebounce(roleFilter, 400)
  const debouncedStatus = useDebounce(statusFilter, 400)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get("/user", {
        params: {
          search: debouncedSearch || undefined,
          role: debouncedRole || undefined,
          status: debouncedStatus || undefined,
          page,
          limit: rowsPerPage,
          sortBy: sortField,
          sortOrder,
        },
      })
      const fetchedUsers: UserDirUser[] = response.data.users || []
      setUsers(fetchedUsers)
      setTotalUsers(response.data.pagination?.total ?? 0)
      setPageCount(response.data.pagination?.pageCount ?? 1)

      if (fetchedUsers.length === 0) {
        setSelectedUser(null)
      } else if (!selectedUserId) {
        setSelectedUser(fetchedUsers[0])
      } else {
        const updatedSelection = fetchedUsers.find((user) => user.id === selectedUserId)
        setSelectedUser(updatedSelection ?? fetchedUsers[0])
      }
    } catch (error) {
      console.error("Failed to load users", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, debouncedRole, debouncedStatus, page, rowsPerPage, sortField, sortOrder, selectedUserId])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserDetails(null)
      return
    }

    let cancelled = false
    setDetailsLoading(true)
    api.get<{ user: UserDirectoryDetails }>(`/user/${selectedUserId}`)
      .then((response) => {
        if (!cancelled) setSelectedUserDetails(response.data.user)
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load user history", error)
          setSelectedUserDetails(null)
        }
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedUserId])

  useEffect(() => {
    setPage(1)
    setSelectedUser(null)
  }, [searchQuery, roleFilter, statusFilter, rowsPerPage, sortField, sortOrder])

  const toggleSort = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"))
  }

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    pageCount,
    totalUsers,
    sortOrder,
    toggleSort,
    selectedUser,
    setSelectedUser,
    selectedUserDetails,
    detailsLoading,
    activeModal,
    setActiveModal,
    fetchUsers,
  }
}
