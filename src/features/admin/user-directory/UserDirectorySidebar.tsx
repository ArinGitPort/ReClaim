import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { Select } from "@/components/ui/Select"
import { Skeleton } from "@/components/ui/Skeleton"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import type { UserDirUser } from "@/features/admin/types"

type UserDirectorySidebarProps = {
  users: UserDirUser[]
  loading: boolean
  selectedUser: UserDirUser | null
  searchQuery: string
  roleFilter: string
  statusFilter: string
  sortOrder: "asc" | "desc"
  page: number
  pageCount: number
  totalUsers: number
  rowsPerPage: number
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onStatusChange: (value: string) => void
  onToggleSort: () => void
  onSelectUser: (user: UserDirUser) => void
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}

export function UserDirectorySidebar({
  users,
  loading,
  selectedUser,
  searchQuery,
  roleFilter,
  statusFilter,
  sortOrder,
  page,
  pageCount,
  totalUsers,
  rowsPerPage,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onToggleSort,
  onSelectUser,
  onPageChange,
  onRowsPerPageChange,
}: UserDirectorySidebarProps) {
  return (
    <div className="w-full xl:w-[420px] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm flex-shrink-0 h-[600px] xl:h-full">
      <div className="p-4 bg-slate-50 border-b border-slate-200 rounded-t-xl space-y-3 shrink-0">
        <AdminSearchInput placeholder="Search name, email, or ID..." value={searchQuery} onChange={onSearchChange} />
        <div className="flex gap-2">
          <Select
            value={roleFilter}
            onChange={(event) => onRoleChange(event.target.value)}
            className="flex-1 h-9 bg-white border-slate-200 rounded-lg shadow-sm text-xs font-bold"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
            <option value="STUDENT">Student</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
            className="flex-1 h-9 bg-white border-slate-200 rounded-lg shadow-sm text-xs font-bold"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="SUSPENDED">Suspended</option>
          </Select>
          <Button
            variant="outline"
            onClick={onToggleSort}
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
          users.map((user) => (
            <button
              type="button"
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                selectedUser?.id === user.id
                  ? "bg-brand/5 border-brand shadow-sm"
                  : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                  selectedUser?.id === user.id ? "bg-brand text-white" : "bg-slate-200 text-slate-700"
                }`}
                >
                  {user.name.substring(0, 2)}
                </div>
                <div>
                  <div className={`font-bold text-sm ${selectedUser?.id === user.id ? "text-brand" : "text-slate-900"}`}>
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user.studentId || "No ID Linked"} {"\u2022"} {user.role}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <StatusBadge status={user.status} className="px-2 py-0.5 text-[8px] shadow-none" />
                    {user.passwordResetRequired && (
                      <StatusBadge status="PASSWORD_RESET_REQUIRED" className="px-2 py-0.5 text-[8px] shadow-none" />
                    )}
                  </div>
                </div>
              </div>
              {(user.metrics?.activeClaims ?? 0) > 0 && (
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Active claims present" />
              )}
            </button>
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
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowsPerPage={false}
          itemLabel="users"
        />
      </div>
    </div>
  )
}
