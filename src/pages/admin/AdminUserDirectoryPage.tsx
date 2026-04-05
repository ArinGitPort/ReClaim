import { ChevronsUpDown, ChevronDown, ChevronUp, Mail, MoreVertical, Users } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"

type UserDirUser = {
  id: string
  name: string
  email: string
  studentId: string | null
  role: string
  createdAt: string
  _count: { claims: number }
}

type UserSortField = "name" | "email" | "role" | "createdAt" | "claims"
type UserSortOrder = "asc" | "desc"

export function UserDirectoryPage() {
  const [users, setUsers] = useState<UserDirUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [pageCount, setPageCount] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [sortField, setSortField] = useState<UserSortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<UserSortOrder>("desc")

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
      setUsers(res.data.users || [])
      setTotalUsers(res.data.pagination?.total ?? 0)
      setPageCount(res.data.pagination?.pageCount ?? 1)
    } catch (err) {
      console.error("Failed to load users", err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, roleFilter, page, rowsPerPage, sortField, sortOrder])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 400)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, roleFilter, rowsPerPage, sortField, sortOrder])

  const toggleSort = (field: UserSortField) => {
    if (sortField === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortField(field)
    setSortOrder("asc")
  }

  const renderSortIcon = (field: UserSortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
    }

    return sortOrder === "asc"
      ? <ChevronUp className="w-3.5 h-3.5 text-brand" />
      : <ChevronDown className="w-3.5 h-3.5 text-brand" />
  }

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="User Directory"
        description="Centralized student database and claim history tracking."
        actions={(
          <>
            <Button
              className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none"
            >
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <AdminExportButton disabled={!users.length} />
          </>
        )}
      />

      <div className="space-y-3">
        <AdminListFilters>
          <AdminSearchInput
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <div className="w-full md:w-56">
            <Select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="STUDENT">Student</option>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600"
            disabled={!searchQuery.length && !roleFilter.length}
            onClick={() => {
              setSearchQuery("")
              setRoleFilter("")
            }}
          >
            Reset
          </Button>
        </AdminListFilters>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
          Showing {users.length} of {totalUsers} user{totalUsers === 1 ? "" : "s"}
        </p>
      </div>

      <AdminTableContainer>
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
              <tr>
                <th className="px-8 py-5 text-slate-700">
                  <button type="button" onClick={() => toggleSort("name")} className="inline-flex items-center gap-1.5 hover:text-brand transition-colors font-bold uppercase tracking-widest text-[10px]">
                    User {renderSortIcon("name")}
                  </button>
                </th>
                <th className="px-8 py-5 text-slate-700">
                  <button type="button" onClick={() => toggleSort("role")} className="inline-flex items-center gap-1.5 hover:text-brand transition-colors font-bold uppercase tracking-widest text-[10px]">
                    Role {renderSortIcon("role")}
                  </button>
                </th>
                <th className="px-8 py-5 text-slate-700">
                  <button type="button" onClick={() => toggleSort("createdAt")} className="inline-flex items-center gap-1.5 hover:text-brand transition-colors font-bold uppercase tracking-widest text-[10px]">
                    Details {renderSortIcon("createdAt")}
                  </button>
                </th>
                <th className="px-8 py-5 text-slate-700">
                  <button type="button" onClick={() => toggleSort("claims")} className="inline-flex items-center gap-1.5 hover:text-brand transition-colors font-bold uppercase tracking-widest text-[10px]">
                    Claim History {renderSortIcon("claims")}
                  </button>
                </th>
                <th className="px-8 py-5 text-right text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">No users found.</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm uppercase">
                          {u.name.substring(0,2)}
                        </div>
                        <div>
                           <div className="font-bold text-slate-900">{u.name}</div>
                           <div className="text-xs text-slate-500 flex items-center gap-1">
                             <Mail className="w-3 h-3" /> {u.email}
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      u.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      u.role === 'STAFF' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {u.studentId ? (
                      <div className="text-sm font-semibold text-slate-700">ID: {u.studentId}</div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">No Student ID</div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 text-sm">
                      {u._count.claims > 0 ? (
                        <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 font-semibold text-xs">
                          {u._count.claims} Past {u._count.claims === 1 ? 'Claim' : 'Claims'}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-sm">No reports</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </AdminTableContainer>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        total={totalUsers}
        visibleCount={users.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(nextRows) => {
          setRowsPerPage(nextRows)
          setPage(1)
        }}
        itemLabel="users"
      />
    </div>
  )
}
