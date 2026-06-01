import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import {
  AddUserModal,
  ClaimHistoryModal,
  EditProfileModal,
  MissingReportsModal,
  PendingVerificationsModal,
} from "@/features/admin/modals"
import {
  UserActivityTimeline,
  UserDirectoryMetricCards,
  UserDirectoryProfileHeader,
  UserDirectorySidebar,
  useUserDirectory,
} from "@/features/admin/user-directory"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"
import type { UserDirUser } from "@/features/admin/types"

export function UserDirectoryPage() {
  const directory = useUserDirectory()

  return (
    <div className="space-y-6">
      <AdminListHeader
        title="User Directory"
        description="Centralized account directory, role management, claim history, and verification desk."
        actions={(
          <>
            <Button
              onClick={() => directory.setActiveModal("add")}
              className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none"
            >
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <AdminExportButton
              title="User Directory Export"
              filename="reclaim-user-directory"
              disabled={!directory.users.length}
              filters={[
                { label: "Search", value: directory.searchQuery || "All" },
                { label: "Role", value: directory.roleFilter || "All" },
                { label: "Status", value: directory.statusFilter || "All" },
              ]}
              fetchRows={() => fetchAllPages<UserDirUser>({
                endpoint: "/user",
                dataKey: "users",
                params: {
                  search: directory.searchQuery.trim() || undefined,
                  role: directory.roleFilter || undefined,
                  status: directory.statusFilter || undefined,
                  sortBy: "name",
                  sortOrder: directory.sortOrder,
                },
              })}
              getRowDate={(user) => user.createdAt}
              columns={[
                { header: "Name", getValue: (user) => user.name },
                { header: "Email", getValue: (user) => user.email, sensitive: true },
                { header: "Student ID", getValue: (user) => user.studentId, sensitive: true },
                { header: "Role", getValue: (user) => user.role },
                { header: "Status", getValue: (user) => user.status },
                { header: "Password Reset Required", getValue: (user) => user.passwordResetRequired ? "Yes" : "No" },
                { header: "Admin Permissions", getValue: (user) => user.adminPermissions ?? [] },
                { header: "Claims", getValue: (user) => user._count.claims },
                { header: "Reports", getValue: (user) => user._count.reports },
                { header: "Created At", getValue: (user) => formatExportDate(user.createdAt) },
              ]}
              sensitiveDescription="This user export can include student IDs and email addresses. Continue only for authorized account administration."
            />
          </>
        )}
      />

      <div className="flex flex-col xl:flex-row items-start gap-6 h-auto xl:h-[calc(100vh-12rem)]">
        <UserDirectorySidebar
          users={directory.users}
          loading={directory.loading}
          selectedUser={directory.selectedUser}
          searchQuery={directory.searchQuery}
          roleFilter={directory.roleFilter}
          statusFilter={directory.statusFilter}
          sortOrder={directory.sortOrder}
          page={directory.page}
          pageCount={directory.pageCount}
          totalUsers={directory.totalUsers}
          rowsPerPage={directory.rowsPerPage}
          onSearchChange={directory.setSearchQuery}
          onRoleChange={directory.setRoleFilter}
          onStatusChange={directory.setStatusFilter}
          onToggleSort={directory.toggleSort}
          onSelectUser={directory.setSelectedUser}
          onPageChange={directory.setPage}
          onRowsPerPageChange={(rows) => {
            directory.setRowsPerPage(rows)
            directory.setPage(1)
          }}
        />

        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col overflow-hidden relative">
          {!directory.selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Users className="w-16 h-16 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Select a user to view details</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
              <UserDirectoryProfileHeader
                user={directory.selectedUser}
                onManageProfile={() => directory.setActiveModal("edit")}
              />
              <div className="p-8 flex-1 min-h-0 flex flex-col gap-8">
                <UserDirectoryMetricCards user={directory.selectedUser} onOpenModal={directory.setActiveModal} />
                <UserActivityTimeline
                  details={directory.selectedUserDetails}
                  isLoading={directory.detailsLoading}
                  selectedUser={directory.selectedUser}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AddUserModal
        isOpen={directory.activeModal === "add"}
        onClose={() => directory.setActiveModal(null)}
        onSaved={() => {
          directory.setActiveModal(null)
          void directory.fetchUsers()
        }}
      />
      <EditProfileModal
        isOpen={directory.activeModal === "edit"}
        onClose={() => directory.setActiveModal(null)}
        onSaved={() => {
          void directory.fetchUsers()
        }}
        user={directory.selectedUser}
      />
      <PendingVerificationsModal
        isOpen={directory.activeModal === "pending"}
        onClose={() => directory.setActiveModal(null)}
        user={directory.selectedUser}
      />
      <MissingReportsModal
        isOpen={directory.activeModal === "missing"}
        onClose={() => directory.setActiveModal(null)}
        user={directory.selectedUser}
      />
      <ClaimHistoryModal
        isOpen={directory.activeModal === "history"}
        onClose={() => directory.setActiveModal(null)}
        user={directory.selectedUser}
      />
    </div>
  )
}
