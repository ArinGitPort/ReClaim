import { StatusBadge } from "@/components/ui/StatusBadge"
import { useEffect, useMemo, useState } from "react"
import { 
  Plus, 
  Filter, 
  Eye,
  Edit,
  ShieldCheck,
  Package,
  MapPin,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import { Modal } from "@/components/ui/Modal"
import { cn, getImageUrl } from "@/lib/utils"
import { LogNewItemModal } from "@/features/admin/modals"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { EditInventoryItemModal, InventoryHandoverModal, InventoryItemDetailsModal } from "@/features/admin/modals"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Skeleton } from "@/components/ui/Skeleton"
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

type InventoryRow = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundAtUtc: string
  foundLocation: string
  date: string
  location: string
  status: string
  storage: string
  privateDiscoveryNote?: string
  photoUrl?: string
}

export function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryRow[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageCount, setPageCount] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showFastEntry, setShowFastEntry] = useState(false)
  const [editItem, setEditItem] = useState<InventoryRow | null>(null)
  const [detailsItem, setDetailsItem] = useState<InventoryRow | null>(null)
  const [handoverItem, setHandoverItem] = useState<InventoryRow | null>(null)
  const debouncedSearch = useDebounce(search, 350)
  const debouncedStatus = useDebounce(statusFilter, 350)
  const debouncedCategory = useDebounce(categoryFilter, 350)

  async function loadItems(): Promise<void> {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{
        items: Array<{
          id: string
          code: string
          title: string
          category: string
          color: string
          foundAtUtc: string
          foundLocation: string
          status: string
          storageLocation?: string | null
          privateDiscoveryNote?: string | null
          privateData?: unknown
          aiEvidenceLogs?: Array<{
            snapshotPath: string
          }>
        }>
        pagination?: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/items/admin", {
        params: {
          search: debouncedSearch.trim() || undefined,
          status: debouncedStatus || undefined,
          category: debouncedCategory || undefined,
          page,
          limit: rowsPerPage,
        },
      })

      setInventoryItems(
        response.data.items.map((item) => ({
          id: item.id,
          code: item.code,
          title: item.title,
          category: item.category,
          color: item.color,
          foundAtUtc: item.foundAtUtc,
          foundLocation: item.foundLocation,
          date: new Date(item.foundAtUtc).toLocaleDateString(),
          location: item.foundLocation,
          status: item.status,
          storage: item.storageLocation ?? "Not assigned",
          privateDiscoveryNote: item.privateDiscoveryNote ?? undefined,
          photoUrl: getImageUrl(extractPhotoPath(item.privateData) ?? item.aiEvidenceLogs?.[0]?.snapshotPath),
        }))
      )
      setTotalItems(response.data.pagination?.total ?? response.data.items.length)
      setPageCount(response.data.pagination?.pageCount ?? 1)
      const serverPage = response.data.pagination?.page ?? page
      if (serverPage !== page) {
        setPage(serverPage)
      }
    } catch {
      setError("Unable to load inventory records.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [statusFilter, categoryFilter, rowsPerPage])

  useEffect(() => {
    void loadItems()
  }, [debouncedSearch, debouncedStatus, debouncedCategory, page, rowsPerPage])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket) {
      return
    }

    const handleItemUpdated = () => {
      void loadItems()
    }

    socket.on("item.updated", handleItemUpdated)
    return () => {
      socket.off("item.updated", handleItemUpdated)
    }
  }, [search, statusFilter, categoryFilter, page, rowsPerPage])

  const statusOptions = useMemo(() => ["AVAILABLE", "CLAIM_PENDING", "ARCHIVED"], [])

  const categoryOptions = useMemo(
    () => Array.from(new Set(inventoryItems.map((item) => item.category))).sort((a, b) => a.localeCompare(b)),
    [inventoryItems]
  )

  const visibleItems = useMemo(() => inventoryItems.filter((item) => item.status !== "RETURNED"), [inventoryItems])

  return (
    <div className="space-y-8">
      <Modal
        isOpen={showFastEntry}
        onClose={() => setShowFastEntry(false)}
        className="w-full max-w-xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        <LogNewItemModal
          onClose={() => setShowFastEntry(false)}
          onSaved={() => {
            void loadItems()
          }}
        />
      </Modal>

      <Modal
        isOpen={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        {editItem && (
          <EditInventoryItemModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSaved={() => {
              void loadItems()
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        {detailsItem && (
          <InventoryItemDetailsModal
            item={detailsItem}
            onClose={() => setDetailsItem(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(handoverItem)}
        onClose={() => setHandoverItem(null)}
        className="w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        {handoverItem && (
          <InventoryHandoverModal
            item={{ id: handoverItem.id, code: handoverItem.code, title: handoverItem.title, status: handoverItem.status }}
            onClose={() => setHandoverItem(null)}
            onCompleted={() => {
              void loadItems()
            }}
          />
        )}
      </Modal>

      <AdminListHeader
        title="Inventory Control"
        description="Manage and audit all securely logged physical items."
        actions={(
          <>
            <Button
              onClick={() => setShowFastEntry(true)}
              className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log New Item
            </Button>
            <AdminExportButton />
          </>
        )}
      />

      <AdminListFilters>
        <AdminSearchInput
          placeholder="Search by Item ID, Title, or Description..."
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
        />
        <div className="w-full md:w-52">
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </Select>
        </div>
        <div className="w-full md:w-52">
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-semibold"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setStatusFilter("")
            setCategoryFilter("")
            setSearch("")
            setPage(1)
          }}
          className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-600"
        >
          <Filter className="w-4 h-4 mr-2" /> Reset
        </Button>
      </AdminListFilters>

      <AdminTableContainer>
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
              <th className="px-8 py-5">Item Identifier</th>
              <th className="px-8 py-5">Found Item Specifications</th>
              <th className="px-8 py-5">Detection Record</th>
              <th className="px-8 py-5">Storage Facility</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Item Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className="text-[11px] font-bold text-slate-500 font-mono tracking-tighter bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all">
                    {item.code}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 tracking-tight">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-600 text-[12px] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      {item.date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                      <span className="truncate max-w-[120px]">{item.location}</span>
                    </div>
                  </div>
                </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/50 text-[11px] font-bold text-slate-600 font-mono">
                      {item.storage}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        label="Edit item"
                        icon={<Edit className="w-4 h-4" />}
                        buttonClassName="bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
                        onClick={() => setEditItem(item)}
                      />

                      <ActionIconButton
                        label="View item details"
                        icon={<Eye className="w-4 h-4" />}
                        buttonClassName="bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300 hover:text-slate-900"
                        onClick={() => setDetailsItem(item)}
                      />
                      <Button
                        type="button"
                        onClick={() => setHandoverItem(item)}
                        disabled={item.status !== "CLAIM_PENDING"}
                        className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                        Start Handover
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`inventory-skeleton-${index}`}>
                    <td colSpan={6} className="px-8 py-4">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-28" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && visibleItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-14 text-center text-slate-400 text-sm font-semibold">
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        {error && <div className="px-8 py-4 text-sm font-semibold text-rose-600 border-t border-slate-100">{error}</div>}
      </AdminTableContainer>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        total={totalItems}
        visibleCount={visibleItems.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(nextRows) => {
          setRowsPerPage(nextRows)
          setPage(1)
        }}
        itemLabel="items"
      />
    </div>
  )
}

function ActionIconButton({
  label,
  icon,
  onClick,
  disabled,
  buttonClassName,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  buttonClassName: string
}) {
  return (
    <div className="relative group/tooltip">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "p-2.5 rounded-xl transition-all shadow-sm border disabled:opacity-45 disabled:cursor-not-allowed",
          buttonClassName
        )}
      >
        {icon}
      </button>
      <span className="pointer-events-none absolute bottom-full right-0 mb-2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-extrabold text-white opacity-0 translate-y-1 transition-all group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}

function extractPhotoPath(privateData: unknown): string | undefined {
  if (!privateData || typeof privateData !== "object") {
    return undefined
  }

  const maybePhoto = (privateData as { photoUrl?: unknown }).photoUrl
  return typeof maybePhoto === "string" ? maybePhoto : undefined
}


