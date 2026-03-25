import { useEffect, useMemo, useState } from "react"
import { Eye, Search, ShieldCheck, X } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { api } from "@/lib/api"

type HandoverLogRow = {
  id: string
  pickupTokenPresented: string
  releasedAtUtc: string
  note?: string | null
  claim?: {
    claimCode: string
  } | null
  foundItem: {
    code: string
    title: string
    category: string
    storageLocation?: string | null
    status: string
  }
  releasedToUser: {
    name: string
    studentId?: string | null
    email: string
  }
}

export function HandoverLogPage() {
  const [logs, setLogs] = useState<HandoverLogRow[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [logsSearch, setLogsSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [selectedLog, setSelectedLog] = useState<HandoverLogRow | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)

  const sourceOptions = useMemo(
    () => [
      { label: "Manual Claim", value: "CLAIM" },
      { label: "Report Match", value: "REPORT_MATCH" },
    ],
    []
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadHandoverLogs({
        search: logsSearch.trim() || undefined,
        source: sourceFilter || undefined,
        page,
        limit: rowsPerPage,
      })
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [logsSearch, sourceFilter, page, rowsPerPage])

  useEffect(() => {
    setPage(1)
  }, [logsSearch, sourceFilter, rowsPerPage])

  async function loadHandoverLogs(input: { search?: string; source?: string; page: number; limit: number }): Promise<void> {
    setIsLoadingLogs(true)
    try {
      const response = await api.get<{
        handovers: HandoverLogRow[]
        pagination: {
          page: number
          limit: number
          total: number
          pageCount: number
        }
      }>("/handover/logs", {
        params: {
          search: input.search,
          source: input.source,
          page: input.page,
          limit: input.limit,
        },
      })

      setLogs(response.data.handovers || [])
      setTotal(response.data.pagination?.total || 0)
      setPageCount(response.data.pagination?.pageCount || 1)
    } catch (err) {
      console.error("[HANDOVER LOG] Failed to load logs:", err)
      setLogs([])
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const resultLabel = useMemo(() => {
    return `Showing ${logs?.length || 0} of ${total} result${total === 1 ? "" : "s"}`
  }, [logs?.length, total])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {selectedLog && (
        <HandoverDetailModal logData={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Handover Log</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Permanent record of successful returns and student handovers.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
            <Input
              value={logsSearch}
              onChange={(e) => setLogsSearch(e.target.value)}
              placeholder="Search by source code, item, inventory code, or token"
              style={{ paddingLeft: '2.5rem', height: '2.75rem', width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ width: '14rem' }}>
            <Select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              style={{ height: '2.75rem', width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            >
              <option value="">All Statuses</option>
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            style={{ height: '2.75rem', padding: '0 1rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer' }}
            disabled={!logsSearch.length && !sourceFilter.length}
            onClick={() => {
              setLogsSearch("")
              setSourceFilter("")
              setPage(1)
            }}
          >
            Reset
          </Button>
        </div>

        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', textAlign: 'right', margin: 0 }}>{resultLabel}</p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Released At</th>
                <th style={{ padding: '0.75rem 1rem' }}>Item</th>
                <th style={{ padding: '0.75rem 1rem' }}>Claim</th>
                <th style={{ padding: '0.75rem 1rem' }}>Token</th>
                <th style={{ padding: '0.75rem 1rem' }}>Released To</th>
                <th style={{ padding: '0.75rem 1rem' }}>Notes</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{new Date(log.releasedAtUtc).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>{log.foundItem.code}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{log.foundItem.title} • {log.foundItem.category}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{log.claim?.claimCode ?? "N/A"}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>{log.pickupTokenPresented}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>{log.releasedToUser.name}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{log.releasedToUser.studentId ?? "N/A"}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{log.note?.trim() ? log.note : "-"}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedLog(log)}
                      style={{ height: '2rem', padding: '0 0.75rem', border: '1px solid #E2E8F0', borderRadius: '0.375rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}
                    >
                      <Eye style={{ marginRight: '0.375rem', height: '0.875rem', width: '0.875rem' }} /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {isLoadingLogs && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Loading handover logs...</td>
                </tr>
              )}
              {!isLoadingLogs && logs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>No returned-item handover logs found for current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onChange={(event) => setRowsPerPage(Number(event.target.value))}
            style={{ height: '2.25rem', width: '6rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 700 }}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </Select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            type="button"
            variant="outline"
            style={{ height: '2.25rem', padding: '0 0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', cursor: 'pointer', borderRadius: '0.375rem' }}
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Page {page} of {pageCount}</span>
          <Button
            type="button"
            variant="outline"
            style={{ height: '2.25rem', padding: '0 0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', cursor: 'pointer', borderRadius: '0.375rem' }}
            disabled={page >= pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function HandoverDetailModal({ logData, onClose }: { logData: HandoverLogRow; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '2.5rem 1rem' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '42rem', overflow: 'hidden', borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', backgroundColor: 'rgba(248, 250, 252, 0.6)', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', width: '2.25rem', height: '2.25rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', backgroundColor: '#1E2F85', color: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <ShieldCheck style={{ width: '1rem', height: '1rem' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', color: '#0F172A', margin: 0 }}>Handover Record Details</h3>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', margin: 0 }}>{logData.claim?.claimCode ?? "No claim reference"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ borderRadius: '9999px', padding: '0.5rem', color: '#94A3B8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <DetailBlock label="Released At" value={new Date(logData.releasedAtUtc).toLocaleString()} />
            <DetailBlock label="Claim Code" value={logData.claim?.claimCode ?? "N/A"} />
            <DetailBlock label="Pickup Token" value={logData.pickupTokenPresented} mono />
            <DetailBlock label="Item Code" value={logData.foundItem.code} mono />
            <DetailBlock label="Item Title" value={logData.foundItem.title} />
            <DetailBlock label="Category" value={logData.foundItem.category} />
            <DetailBlock label="Storage Location" value={logData.foundItem.storageLocation ?? "Unassigned"} />
            <DetailBlock label="Item Status" value={logData.foundItem.status.replaceAll("_", " ")} />
          </div>

          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '1rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Released To</div>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', fontWeight: 900, color: '#1E293B', margin: '0.25rem 0 0 0' }}>{logData.releasedToUser.name}</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', margin: 0 }}>Student ID: {logData.releasedToUser.studentId ?? "N/A"}</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', margin: 0 }}>Email: {logData.releasedToUser.email}</p>
          </div>

          <div style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '1rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>Verification Notes</div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: '0.5rem 0 0 0' }}>{logData.note?.trim() ? logData.note : "No verification notes recorded."}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8' }}>{label}</div>
      <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', fontWeight: mono ? 700 : 600, color: '#334155', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
    </div>
  )
}
