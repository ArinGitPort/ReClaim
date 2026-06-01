import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { DeletedItemsFilters, DeletedItemsTable, useDeletedItems } from "@/features/admin/deleted-items"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"
import type { DeletedItem } from "@/features/admin/deleted-items"

export function DeletedItemsPage() {
  const deletedItems = useDeletedItems()

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Deleted Items"
        description="Soft-deleted inventory records. Restore items here if they were removed by mistake."
        actions={(
          <AdminExportButton
            title="Deleted Items Export"
            filename="reclaim-deleted-items"
            disabled={deletedItems.items.length === 0}
            filters={[{ label: "Search", value: deletedItems.search || "All" }, { label: "Status", value: "ARCHIVED" }]}
            fetchRows={() => fetchAllPages<DeletedItem>({
              endpoint: "/items/admin",
              dataKey: "items",
              params: {
                status: "ARCHIVED",
                search: deletedItems.search.trim() || undefined,
              },
            })}
            getRowDate={(item) => item.foundAtUtc}
            columns={[
              { header: "Code", getValue: (item) => item.code },
              { header: "Title", getValue: (item) => item.title },
              { header: "Category", getValue: (item) => item.category },
              { header: "Color", getValue: (item) => item.color },
              { header: "Found Location", getValue: (item) => item.foundLocation },
              { header: "Storage", getValue: (item) => item.storageLocation },
              { header: "Found Date", getValue: (item) => formatExportDate(item.foundAtUtc) },
              { header: "Private Note", getValue: (item) => item.privateDiscoveryNote, sensitive: true },
            ]}
          />
        )}
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
