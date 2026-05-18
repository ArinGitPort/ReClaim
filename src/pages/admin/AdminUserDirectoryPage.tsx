import { useCallback, useEffect, useMemo, useState } from "react"
import { 
  ChevronDown, ChevronUp, Mail, Users, 
  ShieldAlert, AlertCircle, PackageSearch, History, FileBadge
} from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListHeader, AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { 
  AddUserModal,
  EditProfileModal, 
  PendingVerificationsModal, 
  MissingReportsModal, 
  ClaimHistoryModal 
} from "@/features/admin/modals"
import type { ActiveModalState, UserDirUser } from "@/features/admin/types"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Skeleton } from "@/components/ui/Skeleton"
import type { UserDirectoryDetails } from "@/features/admin/types"

type UserSortField = "name" | "createdAt"

function formatDirectoryDate(value?: string | null) {
  if (!value) return "Never"
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export function UserDirectoryPage() {
  const [users, setUsers] = useState<UserDirUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [pageCount, setPageCount] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const debouncedSearch = useDebounce(searchQuery, 400)
  const debouncedRole = useDebounce(roleFilter, 400)
  const debouncedStatus = useDebounce(statusFilter, 400)
  
  const [sortField] = useState<UserSortField>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Master-Detail selection & Modal state
  const [selectedUser, setSelectedUser] = useState<UserDirUser | null>(null)
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDirectoryDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<ActiveModalState>(null)
  const selectedUserId = selectedUser?.id

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/user', {
        params: {
          search: debouncedSearch || undefined,
          role: debouncedRole || undefined,
          status: debouncedStatus || undefined,
          page,
          limit: rowsPerPage,
          sortBy: sortField,
          sortOrder,
        }
      })
      const fetchedUsers: UserDirUser[] = res.data.users || []
      setUsers(fetchedUsers)
      setTotalUsers(res.data.pagination?.total ?? 0)
      setPageCount(res.data.pagination?.pageCount ?? 1)

      if (fetchedUsers.length === 0) {
        setSelectedUser(null)
      } else if (!selectedUserId) {
        setSelectedUser(fetchedUsers[0])
      } else {
        const updatedSelection = fetchedUsers.find((user) => user.id === selectedUserId)
        setSelectedUser(updatedSelection ?? fetchedUsers[0])
      }
    } catch (err) {
      console.error("Failed to load users", err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, debouncedRole, debouncedStatus, page, rowsPerPage, sortField, sortOrder, selectedUserId])

  useEffect(() => {
    fetchUsers()
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
        if (!cancelled) {
          setSelectedUserDetails(response.data.user)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load user history", error)
          setSelectedUserDetails(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailsLoading(false)
        }
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

  return (
    <div className="space-y-6">
      <AdminListHeader
        title="User Directory"
        description="Centralized account directory, role management, claim history, and verification desk."
        actions={(
          <>
            <Button onClick={() => setActiveModal("add")} className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none">
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <AdminExportButton disabled={!users.length} />
          </>
        )}
      />

      <div className="flex flex-col xl:flex-row items-start gap-6 h-auto xl:h-[calc(100vh-12rem)]">
        
        {/* LEFT PANE: The Master List */}
        <div className="w-full xl:w-[420px] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm flex-shrink-0 h-[600px] xl:h-full">
           <div className="p-4 bg-slate-50 border-b border-slate-200 rounded-t-xl space-y-3 shrink-0">
             <AdminSearchInput
                placeholder="Search name, email, or ID..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <div className="flex gap-2">
                <Select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="flex-1 h-9 bg-white border-slate-200 rounded-lg shadow-sm text-xs font-bold"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                  <option value="STUDENT">Student</option>
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="flex-1 h-9 bg-white border-slate-200 rounded-lg shadow-sm text-xs font-bold"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                  <option value="SUSPENDED">Suspended</option>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={toggleSort}
                  className="h-9 px-3 border-slate-200 text-slate-600 bg-white shadow-sm flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                >
                  {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Sort
                </Button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
             {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`user-skeleton-${index}`} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-2.5 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
             ) : users.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No users found.</div>
             ) : (
               users.map(u => (
                 <div 
                   key={u.id}
                   onClick={() => setSelectedUser(u)}
                   className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                     selectedUser?.id === u.id 
                       ? 'bg-brand/5 border-brand shadow-sm' 
                       : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                   }`}
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                         selectedUser?.id === u.id ? 'bg-brand text-white' : 'bg-slate-200 text-slate-700'
                       }`}>
                         {u.name.substring(0,2)}
                       </div>
                       <div>
                         <div className={`font-bold text-sm ${selectedUser?.id === u.id ? 'text-brand' : 'text-slate-900'}`}>
                           {u.name}
                         </div>
                         <div className="text-[10px] text-slate-500 font-medium">
                           {u.studentId || "No ID Linked"} • {u.role}
                         </div>
                         <div className="mt-1 flex flex-wrap gap-1">
                           <StatusBadge status={u.status} className="px-2 py-0.5 text-[8px] shadow-none" />
                           {u.passwordResetRequired && (
                             <StatusBadge status="PASSWORD_RESET_REQUIRED" className="px-2 py-0.5 text-[8px] shadow-none" />
                           )}
                         </div>
                       </div>
                    </div>
                    {(u.metrics?.activeClaims ?? 0) > 0 && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Active claims present" />
                    )}
                 </div>
               ))
             )}
           </div>

           <div className="p-3 bg-white border-t border-slate-200 shrink-0 rounded-b-xl">
             <PaginationControls
                page={page}
                pageCount={pageCount}
                total={totalUsers}
                visibleCount={users.length}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(nr) => { setRowsPerPage(nr); setPage(1); }}
                showRowsPerPage={false}
                itemLabel="users"
             />
           </div>
        </div>

        {/* RIGHT PANE: Informational User Account Dashboard */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col overflow-hidden relative">
           {!selectedUser ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Users className="w-16 h-16 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-sm">Select a user to view details</p>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
               
               {/* Detail Header Profile Component */}
               <div className="bg-white border-b border-slate-200 p-8 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <ShieldAlert className="w-48 h-48 text-brand" />
                  </div>
                  
                  <div className="flex items-start justify-between relative z-10 w-full flex-col md:flex-row gap-6">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-3xl font-extrabold uppercase shadow-sm text-slate-400">
                          {selectedUser.name.substring(0,2)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{selectedUser.name}</h2>
                          <div className="flex items-center gap-3 mt-1.5 text-slate-500 font-medium text-[13px]">
                             <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5 text-slate-400" /> {selectedUser.email}</span>
                             <span className="text-slate-300">•</span>
                             <span className="flex items-center"><FileBadge className="w-4 h-4 mr-1.5 text-slate-400" /> ID: {selectedUser.studentId || "UNVERIFIED"}</span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded border ${
                              selectedUser.role === 'ADMIN' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              selectedUser.role === 'STUDENT' ? 'bg-brand/10 border-brand/20 text-brand' :
                              'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}>
                              {selectedUser.role} Account
                            </span>
                            <StatusBadge status={selectedUser.status} className="px-2.5 py-1 text-[10px] rounded" />
                            {selectedUser.passwordResetRequired && (
                              <StatusBadge status="PASSWORD_RESET_REQUIRED" className="px-2.5 py-1 text-[10px] rounded" />
                            )}
                            <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-slate-50 border border-slate-200 text-slate-500">
                              Joined {formatDirectoryDate(selectedUser.createdAt)}
                            </span>
                            <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-slate-50 border border-slate-200 text-slate-500">
                              Last Login {formatDirectoryDate(selectedUser.lastLoginAt)}
                            </span>
                          </div>
                        </div>
                     </div>
                     
                     <div className="flex flex-col gap-3 min-w-[140px]">
                        <Button 
                          onClick={() => setActiveModal("edit")}
                          variant="outline" 
                          className="bg-brand hover:bg-brand-active border-none text-white font-bold shadow-sm h-10 w-full uppercase tracking-widest text-[11px]"
                        >
                          Manage Profile
                        </Button>
                     </div>
                  </div>
               </div>

               {/* Central Detail Content */}
               <div className="p-8 flex-1 min-h-0 flex flex-col gap-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Directory Status</p>
                     <div className="mt-2">
                       <StatusBadge status={selectedUser.status} />
                     </div>
                     {selectedUser.disabledReason && (
                       <p className="mt-3 text-xs font-semibold text-slate-500">{selectedUser.disabledReason}</p>
                     )}
                   </div>
                   <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Sign In</p>
                     <p className="mt-2 text-sm font-bold text-slate-800">{formatDirectoryDate(selectedUser.lastLoginAt)}</p>
                     <p className="mt-1 text-xs font-medium text-slate-500">Tracked on successful login.</p>
                   </div>
                   <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password State</p>
                     <div className="mt-2">
                       <StatusBadge status={selectedUser.passwordResetRequired ? "PASSWORD_RESET_REQUIRED" : "ACTIVE"} />
                     </div>
                     <p className="mt-1 text-xs font-medium text-slate-500">
                       {selectedUser.passwordResetRequired ? "Temporary credentials are currently assigned." : "No admin reset is pending."}
                     </p>
                   </div>
                 </div>
                 
                 {/* Quick Statistics Strip (Modal Triggers) */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                      onClick={() => setActiveModal("pending")}
                      className="bg-amber-50 hover:bg-amber-100/50 transition-colors cursor-pointer border border-amber-200 rounded-xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group"
                    >
                       <AlertCircle className="absolute -right-2 -bottom-2 w-20 h-20 text-amber-500 opacity-10 group-hover:scale-110 transition-transform" />
                       <span className="text-amber-800 font-bold text-sm tracking-tight mb-1">Pending Verifications</span>
                       <div className="text-3xl font-black text-amber-600">
                         {selectedUser.metrics?.pendingClaims ?? 0}
                       </div>
                       <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-widest mt-3 flex items-center">
                         Review Queue →
                       </span>
                    </div>

                    <div 
                      onClick={() => setActiveModal("missing")}
                      className="bg-emerald-50 hover:bg-emerald-100/50 transition-colors cursor-pointer border border-emerald-200 rounded-xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group"
                    >
                       <PackageSearch className="absolute -right-2 -bottom-2 w-20 h-20 text-emerald-500 opacity-10 group-hover:scale-110 transition-transform" />
                       <span className="text-emerald-800 font-bold text-sm tracking-tight mb-1">Missing Items Reported</span>
                       <div className="text-3xl font-black text-emerald-600">
                          {selectedUser.metrics?.activeReports ?? 0}
                       </div>
                       <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest mt-3 flex items-center">
                         View Reports →
                       </span>
                    </div>

                    <div 
                      onClick={() => setActiveModal("history")}
                      className="bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer border border-slate-200 rounded-xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group"
                    >
                       <History className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-500 opacity-10 group-hover:scale-110 transition-transform" />
                       <span className="text-slate-800 font-bold text-sm tracking-tight mb-1">Total Lifetime Claims</span>
                       <div className="text-3xl font-black text-slate-600">
                          {selectedUser._count.claims}
                       </div>
                       <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-3 flex items-center">
                         View History →
                       </span>
                    </div>
                 </div>

                 <UserActivityTimeline details={selectedUserDetails} isLoading={detailsLoading} selectedUser={selectedUser} />
               </div>
             </div>
           )}
        </div>
      </div>

      {/* --- REUSABLE COMPONENT MODALS --- */}
      <AddUserModal
        isOpen={activeModal === "add"}
        onClose={() => setActiveModal(null)}
        onSaved={() => {
          setActiveModal(null)
          void fetchUsers()
        }}
      />

      <EditProfileModal 
         isOpen={activeModal === "edit"} 
         onClose={() => setActiveModal(null)} 
         onSaved={() => {
           void fetchUsers()
         }}
         user={selectedUser} 
      />
      
      <PendingVerificationsModal 
         isOpen={activeModal === "pending"} 
         onClose={() => setActiveModal(null)} 
         user={selectedUser} 
      />
      
      <MissingReportsModal 
         isOpen={activeModal === "missing"} 
         onClose={() => setActiveModal(null)} 
         user={selectedUser} 
      />
      
      <ClaimHistoryModal 
         isOpen={activeModal === "history"} 
         onClose={() => setActiveModal(null)} 
         user={selectedUser} 
      />

    </div>
  )
}

type TimelineEntry = {
  id: string
  type: "claim" | "report" | "handover" | "audit"
  title: string
  subtitle: string
  status: string
  createdAt: string
}

function UserActivityTimeline({
  details,
  isLoading,
  selectedUser,
}: {
  details: UserDirectoryDetails | null
  isLoading: boolean
  selectedUser: UserDirUser
}) {
  const [timelinePage, setTimelinePage] = useState(1)
  const [timelineSearch, setTimelineSearch] = useState("")
  const [timelineTypeFilter, setTimelineTypeFilter] = useState("")
  const [timelineStatusFilter, setTimelineStatusFilter] = useState("")
  const timelineRowsPerPage = 5
  const entries = useMemo(() => buildTimelineEntries(details), [details])
  const filteredEntries = useMemo(() => {
    const query = timelineSearch.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesSearch = !query || [
        entry.title,
        entry.subtitle,
        entry.status,
        entry.type,
        formatDirectoryDate(entry.createdAt),
      ].some((value) => value.toLowerCase().includes(query))
      const matchesType = !timelineTypeFilter || entry.type === timelineTypeFilter
      const matchesStatus = !timelineStatusFilter || entry.status === timelineStatusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [entries, timelineSearch, timelineTypeFilter, timelineStatusFilter])
  const statusOptions = useMemo(() => Array.from(new Set(entries.map((entry) => entry.status))).sort(), [entries])
  const timelinePageCount = Math.max(1, Math.ceil(filteredEntries.length / timelineRowsPerPage))
  const safeTimelinePage = Math.min(timelinePage, timelinePageCount)
  const visibleEntries = filteredEntries.slice((safeTimelinePage - 1) * timelineRowsPerPage, safeTimelinePage * timelineRowsPerPage)
  const deniedOrClosedClaims = details?.claims.filter((claim) => ["DENIED", "CANCELLED", "EXPIRED"].includes(claim.status)).length ?? 0
  const rejectedReports = details?.reports.filter((report) => report.status === "REJECTED").length ?? 0
  const riskCount = deniedOrClosedClaims + rejectedReports

  useEffect(() => {
    setTimelinePage(1)
  }, [details?.id])

  useEffect(() => {
    setTimelinePage(1)
  }, [timelineSearch, timelineTypeFilter, timelineStatusFilter])

  return (
    <div className="border-t border-slate-200 pt-6 flex-1 min-h-0 flex flex-col">
      <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Activity Timeline</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Recent claims, reports, handovers, and account actions for {selectedUser.name}.
          </p>
        </div>
        <div className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${riskCount > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {riskCount > 0 ? `${riskCount} review signal${riskCount === 1 ? "" : "s"}` : "No review signals"}
        </div>
      </div>

      <div className="pb-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_180px] gap-3">
        <AdminSearchInput
          placeholder="Search activity..."
          value={timelineSearch}
          onChange={setTimelineSearch}
        />
        <Select
          value={timelineTypeFilter}
          onChange={(event) => setTimelineTypeFilter(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-bold"
        >
          <option value="">All Activity</option>
          <option value="claim">Claims</option>
          <option value="report">Reports</option>
          <option value="handover">Handovers</option>
          <option value="audit">Account Actions</option>
        </Select>
        <Select
          value={timelineStatusFilter}
          onChange={(event) => setTimelineStatusFilter(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-bold"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {formatTimelineStatus(status)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`timeline-skeleton-${index}`} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-2.5 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No activity recorded yet.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No activity matches those filters.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide pr-1">
              {visibleEntries.map((entry) => (
                <div key={`${entry.type}-${entry.id}`} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="mt-0.5 h-9 w-9 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    {timelineIcon(entry.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{entry.title}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                        {formatDirectoryDate(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{entry.subtitle}</p>
                  </div>
                  <StatusBadge status={formatTimelineStatus(entry.status)} className="hidden lg:inline-flex px-2.5 py-1 text-[9px]" />
                </div>
              ))}
            </div>
            <PaginationControls
              page={safeTimelinePage}
              pageCount={timelinePageCount}
              total={filteredEntries.length}
              visibleCount={visibleEntries.length}
              rowsPerPage={timelineRowsPerPage}
              onPageChange={setTimelinePage}
              onRowsPerPageChange={() => {}}
              showRowsPerPage={false}
              itemLabel="activities"
              className="p-3 bg-white border-t border-slate-200 shrink-0"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function buildTimelineEntries(details: UserDirectoryDetails | null): TimelineEntry[] {
  if (!details) return []

  const entries: TimelineEntry[] = [
    ...details.claims.map((claim) => ({
      id: claim.id,
      type: "claim" as const,
      title: `${claim.claimCode} / ${claim.foundItem.title}`,
      subtitle: `Claim for ${claim.foundItem.code} in ${claim.foundItem.foundLocation}`,
      status: claim.status,
      createdAt: claim.createdAt,
    })),
    ...details.reports.map((report) => ({
      id: report.id,
      type: "report" as const,
      title: `${report.reportCode} / ${report.title}`,
      subtitle: `Lost report from ${report.location}`,
      status: report.status,
      createdAt: report.createdAt,
    })),
    ...details.handovers.map((handover) => ({
      id: handover.id,
      type: "handover" as const,
      title: `Returned ${handover.foundItem.code}`,
      subtitle: `${handover.foundItem.title} released with pickup token ${handover.pickupTokenPresented}`,
      status: "RETURNED",
      createdAt: handover.releasedAtUtc,
    })),
    ...details.auditLogs.map((log) => ({
      id: log.id,
      type: "audit" as const,
      title: log.action.replaceAll("_", " "),
      subtitle: log.description ?? `${log.actorUser.name} performed this action`,
      status: log.actorUser.role,
      createdAt: log.createdAt,
    })),
  ]

  return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function timelineIcon(type: TimelineEntry["type"]) {
  if (type === "claim") return <AlertCircle className="w-4 h-4" />
  if (type === "report") return <PackageSearch className="w-4 h-4" />
  if (type === "handover") return <History className="w-4 h-4" />
  return <ShieldAlert className="w-4 h-4" />
}

function formatTimelineStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
