import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import {
  ExpiredInventoryFilters,
  ExpiredInventoryTable,
  useExpiredInventory,
} from "@/features/admin/expired-inventory"

export function ExpiredInventoryPage() {
  const inventory = useExpiredInventory()

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Expired Inventory"
        description={`Manage items that have exceeded the ${inventory.retentionDays}-day retention period.`}
        actions={(
          <div className="flex gap-2">
            <Button
              onClick={() => inventory.setShowDisposeConfirm(true)}
              disabled={inventory.selectedIds.size === 0 || inventory.isDisposing}
              className="flex-1 sm:flex-initial h-10 px-4 bg-status-error hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm border-none disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100 disabled:shadow-none transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Dispose Selected ({inventory.selectedIds.size})
            </Button>
            <AdminExportButton disabled={inventory.items.length === 0} />
          </div>
        )}
      />

      <ExpiredInventoryFilters
        searchQuery={inventory.searchQuery}
        itemCount={inventory.items.length}
        onSearchChange={inventory.setSearchQuery}
        onReset={inventory.resetFilters}
      />

      <ExpiredInventoryTable
        items={inventory.items}
        loading={inventory.loading}
        retentionDays={inventory.retentionDays}
        selectedIds={inventory.selectedIds}
        focusCode={inventory.focusCode}
        onToggleSelect={inventory.toggleSelect}
        onToggleSelectAll={inventory.toggleSelectAll}
      />

      <ConfirmModal
        isOpen={inventory.showDisposeConfirm}
        onClose={() => !inventory.isDisposing && inventory.setShowDisposeConfirm(false)}
        onConfirm={() => void inventory.handleBatchDispose()}
        title="Dispose Inventory"
        message={`Are you sure you want to dispose ${inventory.selectedIds.size} item${inventory.selectedIds.size === 1 ? "" : "s"}?`}
        confirmText="Dispose"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={inventory.isDisposing}
      />
    </div>
  )
}
