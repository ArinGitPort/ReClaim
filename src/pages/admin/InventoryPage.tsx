import { useEffect, useMemo, useState } from "react"
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  Eye,
  Edit,
  Link2,
  ShieldCheck,
  Package,
  MapPin,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ActionIconButton } from "@/components/ui/ActionIconButton"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { LogNewItemModal } from "@/features/admin/LogNewItemModal"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { EditInventoryItemModal } from "@/features/admin/EditInventoryItemModal"
import { InventoryLinkReportModal } from "@/features/admin/InventoryLinkReportModal"
import { InventoryItemDetailsModal } from "@/features/admin/InventoryItemDetailsModal"
import { InventoryHandoverModal } from "@/features/admin/InventoryHandoverModal"
import { AdminPaginationControls } from "@/components/admin/AdminPaginationControls"

const pageContainerStyles: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '2rem' 
}

const modalOverlayStyles: React.CSSProperties = { 
  position: 'fixed', 
  inset: 0, 
  zIndex: 100, 
  display: 'flex', 
  alignItems: 'flex-start', 
  justifyContent: 'center', 
  overflowY: 'auto', 
  padding: '2.5rem 1rem' 
}

const modalBackdropStyles: React.CSSProperties = { 
  position: 'fixed', 
  inset: 0, 
  backgroundColor: 'rgba(15, 23, 42, 0.8)' 
}

const modalContentStyles = (maxWidth: string): React.CSSProperties => ({ 
  position: 'relative', 
  width: '100%', 
  maxWidth, 
  backgroundColor: '#FFFFFF', 
  borderRadius: '0.75rem', 
  overflow: 'hidden', 
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
  border: '1px solid #E2E8F0', 
  margin: 'auto' 
})

const headerWrapperStyles: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  gap: '1rem', 
  marginBottom: '2rem' 
}

const headerTitleStyles: React.CSSProperties = { 
  fontSize: '1.875rem', 
  fontWeight: 800, 
  color: '#0F172A', 
  letterSpacing: '-0.025em', 
  margin: 0 
}

const headerSubtitleStyles: React.CSSProperties = { 
  color: '#64748B', 
  fontSize: '0.875rem', 
  fontWeight: 500, 
  marginTop: '0.25rem', 
  margin: '0.25rem 0 0 0' 
}

const headerActionsStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem' 
}

const primaryBtnStyles: React.CSSProperties = { 
  height: '2.5rem', 
  padding: '0 1rem', 
  backgroundColor: '#1E2F85', 
  color: '#FFFFFF', 
  fontWeight: 700, 
  borderRadius: '0.75rem', 
  border: 'none', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
}

const outlineBtnStyles: React.CSSProperties = { 
  height: '2.5rem', 
  padding: '0 1rem', 
  border: '1px solid #E2E8F0', 
  color: '#475569', 
  fontWeight: 700, 
  borderRadius: '0.75rem', 
  backgroundColor: '#FFFFFF', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center' 
}

const filterAreaStyles: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'row', 
  gap: '1rem' 
}

const searchWrapperStyles: React.CSSProperties = { 
  position: 'relative', 
  flex: 1 
}

const searchIconStyles: React.CSSProperties = { 
  position: 'absolute', 
  left: '1rem', 
  top: '50%', 
  transform: 'translateY(-50%)', 
  width: '1rem', 
  height: '1rem', 
  color: '#94A3B8' 
}

const searchInputStyles: React.CSSProperties = { 
  paddingLeft: '3rem', 
  height: '3rem', 
  width: '100%', 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #E2E8F0', 
  borderRadius: '0.75rem', 
  fontSize: '0.875rem', 
  fontWeight: 500, 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  boxSizing: 'border-box' 
}

const filterSelectWrapperStyles: React.CSSProperties = { 
  width: '13rem' 
}

const filterSelectStyles: React.CSSProperties = { 
  height: '3rem', 
  width: '100%', 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #E2E8F0', 
  borderRadius: '0.75rem', 
  fontSize: '0.875rem', 
  fontWeight: 600, 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
}

const resetBtnStyles: React.CSSProperties = { 
  height: '3rem', 
  padding: '0 1.5rem', 
  border: '1px solid #E2E8F0', 
  backgroundColor: '#FFFFFF', 
  borderRadius: '0.75rem', 
  color: '#475569', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  fontSize: '0.75rem', 
  display: 'flex', 
  alignItems: 'center', 
  cursor: 'pointer', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
}

const tableContainerStyles: React.CSSProperties = { 
  backgroundColor: '#FFFFFF', 
  borderRadius: '0.75rem', 
  border: '1px solid #E2E8F0', 
  overflow: 'hidden', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
}

const tableHeaderRowStyles: React.CSSProperties = { 
  backgroundColor: '#F8FAFC', 
  borderBottom: '1px solid #F1F5F9', 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  fontWeight: 700, 
  fontSize: '10px', 
  color: '#334155' 
}

const tableHeaderCellStyles: React.CSSProperties = { 
  padding: '1.25rem 2rem' 
}

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

const tableRowStyles: React.CSSProperties = { 
  borderBottom: '1px solid #F1F5F9' 
}

const tableCellStyles: React.CSSProperties = { 
  padding: '1.25rem 2rem' 
}

const itemCodeBadgeStyles: React.CSSProperties = { 
  fontSize: '11px', 
  fontWeight: 700, 
  color: '#64748B', 
  fontFamily: 'monospace', 
  letterSpacing: '-0.025em', 
  backgroundColor: '#F1F5F9', 
  padding: '0.375rem 0.75rem', 
  borderRadius: '0.5rem', 
  border: '1px solid rgba(226, 232, 240, 0.5)' 
}

const itemSpecWrapperStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '1rem' 
}

const itemImageContainerStyles: React.CSSProperties = { 
  width: '2.75rem', 
  height: '2.75rem', 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #F1F5F9', 
  borderRadius: '0.75rem', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  flexShrink: 0, 
  overflow: 'hidden' 
}

const itemTitleStyles: React.CSSProperties = { 
  fontWeight: 700, 
  color: '#0F172A', 
  letterSpacing: '-0.025em' 
}

const itemCategoryBadgeStyles: React.CSSProperties = { 
  fontSize: '10px', 
  color: '#94A3B8', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.05em', 
  marginTop: '0.125rem' 
}

const recordListStyles: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '0.375rem' 
}

const secondaryTextStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  color: '#94A3B8', 
  fontSize: '11px', 
  fontWeight: 500 
}

const storageBadgeStyles: React.CSSProperties = { 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  padding: '0.375rem 0.75rem', 
  backgroundColor: '#F8FAFC', 
  borderRadius: '0.5rem', 
  border: '1px solid rgba(226, 232, 240, 0.5)', 
  fontSize: '11px', 
  fontWeight: 700, 
  color: '#475569', 
  fontFamily: 'monospace' 
}

const rowActionsWrapperStyles: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'flex-end', 
  gap: '0.5rem' 
}

export function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryRow[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [pageCount, setPageCount] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showFastEntry, setShowFastEntry] = useState(false)
  const [editItem, setEditItem] = useState<InventoryRow | null>(null)
  const [linkItem, setLinkItem] = useState<InventoryRow | null>(null)
  const [detailsItem, setDetailsItem] = useState<InventoryRow | null>(null)
  const [handoverItem, setHandoverItem] = useState<InventoryRow | null>(null)

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
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
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
          photoUrl: resolveImageUrl(extractPhotoPath(item.privateData) ?? item.aiEvidenceLogs?.[0]?.snapshotPath),
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
    const timeoutId = window.setTimeout(() => {
      void loadItems()
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [search, statusFilter, categoryFilter, page, rowsPerPage])

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
    <div style={pageContainerStyles}>
      {showFastEntry && (
        <div style={modalOverlayStyles}>
          <div style={modalBackdropStyles} onClick={() => setShowFastEntry(false)} />
          <div style={modalContentStyles('36rem')}>
            <LogNewItemModal
              onClose={() => setShowFastEntry(false)}
              onSaved={() => {
                void loadItems()
              }}
            />
          </div>
        </div>
      )}

      {editItem && (
        <div style={modalOverlayStyles}>
          <div style={modalBackdropStyles} onClick={() => setEditItem(null)} />
          <div style={modalContentStyles('42rem')}>
            <EditInventoryItemModal
              item={editItem}
              onClose={() => setEditItem(null)}
              onSaved={() => {
                void loadItems()
              }}
            />
          </div>
        </div>
      )}

      {linkItem && (
        <div style={modalOverlayStyles}>
          <div style={modalBackdropStyles} onClick={() => setLinkItem(null)} />
          <div style={modalContentStyles('48rem')}>
            <InventoryLinkReportModal
              item={{ id: linkItem.id, code: linkItem.code, title: linkItem.title, category: linkItem.category, color: linkItem.color }}
              onClose={() => setLinkItem(null)}
              onLinked={() => {
                void loadItems()
              }}
            />
          </div>
        </div>
      )}

      {detailsItem && (
        <div style={modalOverlayStyles}>
          <div style={modalBackdropStyles} onClick={() => setDetailsItem(null)} />
          <div style={modalContentStyles('42rem')}>
            <InventoryItemDetailsModal
              item={detailsItem}
              onClose={() => setDetailsItem(null)}
            />
          </div>
        </div>
      )}

      {handoverItem && (
        <div style={modalOverlayStyles}>
          <div style={modalBackdropStyles} onClick={() => setHandoverItem(null)} />
          <div style={modalContentStyles('48rem')}>
            <InventoryHandoverModal
              item={{ id: handoverItem.id, code: handoverItem.code, title: handoverItem.title, status: handoverItem.status }}
              onClose={() => setHandoverItem(null)}
              onCompleted={() => {
                void loadItems()
              }}
            />
          </div>
        </div>
      )}

      {/* Consistent Header Pattern */}
      <div style={headerWrapperStyles}>
        <div>
          <h1 style={headerTitleStyles}>Inventory Control</h1>
          <p style={headerSubtitleStyles}>Manage and audit all securely logged physical items.</p>
        </div>
        <div style={headerActionsStyles}>
          <Button 
            onClick={() => setShowFastEntry(true)}
            style={primaryBtnStyles}
          >
            <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Log New Item
          </Button>
          <Button variant="outline" style={outlineBtnStyles}>
            <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Export
          </Button>
        </div>
      </div>

      {/* List Search and Filter Area */}
      <div style={filterAreaStyles}>
        <div style={searchWrapperStyles}>
          <Search style={searchIconStyles} />
          <Input 
            placeholder="Search by Item ID, Title, or Description..." 
            style={searchInputStyles}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div style={filterSelectWrapperStyles}>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={filterSelectStyles}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </Select>
        </div>
        <div style={filterSelectWrapperStyles}>
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            style={filterSelectStyles}
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
          style={resetBtnStyles}
        >
          <Filter style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Reset
        </Button>
      </div>

      {/* Inventory Table Container */}
      <div style={tableContainerStyles}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={tableHeaderRowStyles}>
                <th style={tableHeaderCellStyles}>Item Identifier</th>
                <th style={tableHeaderCellStyles}>Found Item Specifications</th>
                <th style={tableHeaderCellStyles}>Detection Record</th>
                <th style={tableHeaderCellStyles}>Storage Facility</th>
                <th style={tableHeaderCellStyles}>Status</th>
                <th style={{ ...tableHeaderCellStyles, textAlign: 'right' }}>Item Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {visibleItems.map((item) => (
                <InventoryTableRow
                  key={item.id}
                  item={item}
                  onEdit={() => setEditItem(item)}
                  onLink={() => setLinkItem(item)}
                  onViewDetails={() => setDetailsItem(item)}
                  onHandover={() => setHandoverItem(item)}
                />
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem', fontWeight: 600 }}>
                    Loading inventory records...
                  </td>
                </tr>
              )}
              {!isLoading && visibleItems.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem', fontWeight: 600 }}>
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {error && <div style={{ padding: '1rem 2rem', color: '#E11D48', fontSize: '0.875rem', fontWeight: 600, borderTop: '1px solid #F1F5F9' }}>{error}</div>}
      </div>

      <AdminPaginationControls
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

function InventoryTableRow({
  item,
  onEdit,
  onLink,
  onViewDetails,
  onHandover
}: {
  item: InventoryRow
  onEdit: () => void
  onLink: () => void
  onViewDetails: () => void
  onHandover: () => void
}) {
  return (
    <tr style={tableRowStyles}>
      <td style={{ ...tableCellStyles, whiteSpace: 'nowrap' }}>
        <span style={itemCodeBadgeStyles}>
          {item.code}
        </span>
      </td>
      <td style={tableCellStyles}>
        <div style={itemSpecWrapperStyles}>
          <div style={itemImageContainerStyles}>
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Package style={{ width: '1.25rem', height: '1.25rem', color: '#CBD5E1' }} />
            )}
          </div>
          <div>
            <div style={itemTitleStyles}>{item.title}</div>
            <div style={itemCategoryBadgeStyles}>{item.category}</div>
          </div>
        </div>
      </td>
      <td style={tableCellStyles}>
        <div style={recordListStyles}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '12px', fontWeight: 700 }}>
            <Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#CBD5E1' }} />
            {item.date}
          </div>
          <div style={secondaryTextStyles}>
            <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#E2E8F0', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{item.location}</span>
          </div>
        </div>
      </td>
      <td style={tableCellStyles}>
        <div style={storageBadgeStyles}>
          {item.storage}
        </div>
      </td>
      <td style={tableCellStyles}>
        <StatusBadge status={item.status} />
      </td>
      <td style={{ ...tableCellStyles, textAlign: 'right' }}>
        <div style={rowActionsWrapperStyles}>
          <ActionIconButton
            label="Edit item"
            icon={<Edit style={{ width: '1rem', height: '1rem' }} />}
            style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
            onClick={onEdit}
          />
          <ActionIconButton
            label={item.status === "AVAILABLE" ? "Link to active report" : "Only available items can be linked"}
            icon={<Link2 style={{ width: '1rem', height: '1rem' }} />}
            style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', color: '#075985' }}
            onClick={onLink}
            disabled={item.status !== "AVAILABLE"}
          />
          <ActionIconButton
            label="View item details"
            icon={<Eye style={{ width: '1rem', height: '1rem' }} />}
            style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', color: '#334155' }}
            onClick={onViewDetails}
          />
          <Button
            type="button"
            onClick={onHandover}
            disabled={item.status !== "CLAIM_PENDING"}
            style={{ 
              height: '2.25rem', 
              padding: '0 0.75rem', 
              fontSize: '10px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              backgroundColor: item.status === 'CLAIM_PENDING' ? '#059669' : '#CBD5E1', 
              color: item.status === 'CLAIM_PENDING' ? '#FFFFFF' : '#64748B',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: item.status === 'CLAIM_PENDING' ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ShieldCheck style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.375rem' }} />
            Start Handover
          </Button>
        </div>
      </td>
    </tr>
  )
}

function extractPhotoPath(privateData: unknown): string | undefined {
  if (!privateData || typeof privateData !== "object") {
    return undefined
  }

  const maybePhoto = (privateData as { photoUrl?: unknown }).photoUrl
  return typeof maybePhoto === "string" ? maybePhoto : undefined
}

function resolveImageUrl(path?: string): string | undefined {
  if (!path) {
    return undefined
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"
  const origin = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`
}
