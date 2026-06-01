import { Plus } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { InventoryFilters, InventoryModals, InventoryTable, useInventory } from "@/features/admin/inventory"
import { mapInventoryRow, type ApiInventoryItem } from "@/features/admin/inventory/inventoryUtils"
import { fetchAllPages, formatExportDate } from "@/lib/exportUtils"

export function InventoryPage() {
  const [searchParams] = useSearchParams()
  const focusCode = (searchParams.get("focus") ?? "").toUpperCase()
  const inventory = useInventory(searchParams.get("status"))

  return (
    <div className="space-y-8">
      <InventoryModals
        showFastEntry={inventory.showFastEntry}
        editItem={inventory.editItem}
        detailsItem={inventory.detailsItem}
        handoverItem={inventory.handoverItem}
        onCloseFastEntry={() => inventory.setShowFastEntry(false)}
        onCloseEdit={() => inventory.setEditItem(null)}
        onCloseDetails={() => inventory.setDetailsItem(null)}
        onCloseHandover={() => inventory.setHandoverItem(null)}
        onRefresh={() => {
          void inventory.loadItems()
        }}
      />

      <AdminListHeader
        title="Inventory Management"
        description="Manage and audit all securely logged physical items."
        actions={(
          <>
            <Button
              onClick={() => inventory.setShowFastEntry(true)}
              className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log New Item
            </Button>
            <AdminExportButton
              title="Inventory Export"
              filename="reclaim-inventory"
              disabled={inventory.isLoading || inventory.totalItems === 0}
              filters={[
                { label: "Search", value: inventory.search || "All" },
                { label: "Status", value: inventory.statusFilter || "All" },
                { label: "Category", value: inventory.categoryFilter || "All" },
              ]}
              fetchRows={async () => {
                const items = await fetchAllPages<ApiInventoryItem>({
                  endpoint: "/items/admin",
                  dataKey: "items",
                  params: {
                    search: inventory.search.trim() || undefined,
                    status: inventory.statusFilter || undefined,
                    category: inventory.categoryFilter || undefined,
                  },
                })
                return items.map(mapInventoryRow).filter((item) => item.status !== "RETURNED")
              }}
              image={{
                header: "Photo URL",
                getUrl: (item) => item.photoUrl,
                getAlt: (item) => item.title,
              }}
              getRowDate={(item) => item.foundAtUtc}
              columns={[
                { header: "Code", getValue: (item) => item.code },
                { header: "Title", getValue: (item) => item.title },
                { header: "Category", getValue: (item) => item.category },
                { header: "Color", getValue: (item) => item.color },
                { header: "Status", getValue: (item) => item.status },
                { header: "Found Location", getValue: (item) => item.foundLocation || item.location },
                { header: "Storage", getValue: (item) => item.storage },
                { header: "Found Date", getValue: (item) => formatExportDate(item.foundAtUtc) },
                { header: "Private Note", getValue: (item) => item.privateDiscoveryNote, sensitive: true },
              ]}
              sensitiveDescription="This inventory export can include private discovery notes. Continue only if this file will be handled as an internal administrative record."
            />
          </>
        )}
      />

      <InventoryFilters
        search={inventory.search}
        statusFilter={inventory.statusFilter}
        categoryFilter={inventory.categoryFilter}
        statusOptions={inventory.statusOptions}
        onSearchChange={(value) => {
          inventory.setSearch(value)
          inventory.setPage(1)
        }}
        onStatusChange={inventory.setStatusFilter}
        onCategoryChange={inventory.setCategoryFilter}
        onReset={inventory.resetFilters}
      />

      <InventoryTable
        items={inventory.visibleItems}
        isLoading={inventory.isLoading}
        error={inventory.error}
        focusCode={focusCode}
        onEdit={inventory.setEditItem}
        onDetails={inventory.setDetailsItem}
        onHandover={inventory.setHandoverItem}
      />

      <PaginationControls
        page={inventory.page}
        pageCount={inventory.pageCount}
        total={inventory.totalItems}
        visibleCount={inventory.visibleItems.length}
        rowsPerPage={inventory.rowsPerPage}
        onPageChange={inventory.setPage}
        onRowsPerPageChange={(nextRows) => {
          inventory.setRowsPerPage(nextRows)
          inventory.setPage(1)
        }}
        itemLabel="items"
      />
    </div>
  )
}
