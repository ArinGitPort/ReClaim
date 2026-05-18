import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { DeletedItemsFilters, DeletedItemsTable, useDeletedItems } from "@/features/admin/deleted-items"

export function DeletedItemsPage() {
  const deletedItems = useDeletedItems()

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Deleted Items"
        description="Soft-deleted inventory records. Restore items here if they were removed by mistake."
        actions={<AdminExportButton disabled={deletedItems.items.length === 0} />}
      />

      <DeletedItemsFilters
        search={deletedItems.search}
        itemCount={deletedItems.items.length}
        onSearchChange={deletedItems.setSearch}
        onReset={() => deletedItems.setSearch("")}
      />

      <DeletedItemsTable
        items={deletedItems.items}
        isLoading={deletedItems.isLoading}
        restoringId={deletedItems.restoringId}
        onRestore={(itemId) => void deletedItems.restoreItem(itemId)}
      />
    </div>
  )
}
