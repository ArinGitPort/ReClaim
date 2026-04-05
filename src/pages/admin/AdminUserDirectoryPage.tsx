import { useCallback, useEffect, useState } from "react"
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
import { 
  EditProfileModal, 
  PendingVerificationsModal, 
  MissingReportsModal, 
  ClaimHistoryModal 
} from "@/features/admin/modals"
import type { ActiveModalState, UserDirUser } from "@/features/admin/types"

type UserSortField = "name" | "createdAt"

export function UserDirectoryPage() {
  const [users, setUsers] = useState<UserDirUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [pageCount, setPageCount] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  
  const [sortField] = useState<UserSortField>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Master-Detail selection & Modal state
  const [selectedUser, setSelectedUser] = useState<UserDirUser | null>(null)
  const [activeModal, setActiveModal] = useState<ActiveModalState>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/user', {
        params: {
          search: searchQuery || undefined,
          role: roleFilter || undefined,
          page,
          limit: rowsPerPage,
          sortBy: sortField,
          sortOrder,
        }
      })
      const fetchedUsers = res.data.users || []
      setUsers(fetchedUsers)
      setTotalUsers(res.data.pagination?.total ?? 0)
      setPageCount(res.data.pagination?.pageCount ?? 1)

      if (!selectedUser && fetchedUsers.length > 0) {
        setSelectedUser(fetchedUsers[0])
      }
    } catch (err) {
      console.error("Failed to load users", err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, roleFilter, page, rowsPerPage, sortField, sortOrder, selectedUser])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 400)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  useEffect(() => {
    setPage(1)
    setSelectedUser(null)
  }, [searchQuery, roleFilter, rowsPerPage, sortField, sortOrder])

  const toggleSort = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="space-y-6">
      <AdminListHeader
        title="User Account Management"
        description="Centralized student database, claim history tracking, and verification desk."
        actions={(
          <>
            <Button className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none">
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

           <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {loading ? (
                <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading...</div>
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
                       </div>
                    </div>
                    {u._count.claims > 0 && (
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
             <div className="flex-1 overflow-y-auto">
               
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
                          <div className="mt-4 flex gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded border ${
                              selectedUser.role === 'ADMIN' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              selectedUser.role === 'STUDENT' ? 'bg-brand/10 border-brand/20 text-brand' :
                              'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}>
                              {selectedUser.role} Account
                            </span>
                            <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-slate-50 border border-slate-200 text-slate-500">
                              Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                     </div>
                     
                     <div className="flex flex-col gap-3 min-w-[140px]">
                        <Button 
                          onClick={() => setActiveModal("edit")}
                          variant="outline" 
                          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold shadow-sm h-10 w-full uppercase tracking-widest text-[11px]"
                        >
                          Manage Profile
                        </Button>
                     </div>
                  </div>
               </div>

               {/* Central Detail Content */}
               <div className="p-8 space-y-8 flex-shrink-0">
                 
                 {/* Quick Statistics Strip (Modal Triggers) */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                      onClick={() => setActiveModal("pending")}
                      className="bg-amber-50 hover:bg-amber-100/50 transition-colors cursor-pointer border border-amber-200 rounded-xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group"
                    >
                       <AlertCircle className="absolute -right-2 -bottom-2 w-20 h-20 text-amber-500 opacity-10 group-hover:scale-110 transition-transform" />
                       <span className="text-amber-800 font-bold text-sm tracking-tight mb-1">Pending Verifications</span>
                       <div className="text-3xl font-black text-amber-600">
                         {selectedUser._count.claims > 0 ? 1 : 0}
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
                          {selectedUser.studentId ? 2 : 0}
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

                 {/* No longer showing inline lists! They are offloaded to Modals. Keep the UI incredibly clean. */}
                 <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed text-slate-400 mt-8">
                     <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p className="font-bold text-sm">Select metrics above to view details</p>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* --- REUSABLE COMPONENT MODALS --- */}
      <EditProfileModal 
         isOpen={activeModal === "edit"} 
         onClose={() => setActiveModal(null)} 
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
