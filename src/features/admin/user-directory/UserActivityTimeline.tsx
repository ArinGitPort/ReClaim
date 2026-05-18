import { useEffect, useMemo, useState } from "react"
import { AlertCircle, History, PackageSearch, ShieldAlert } from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { Select } from "@/components/ui/Select"
import { Skeleton } from "@/components/ui/Skeleton"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { AdminSearchInput } from "@/features/admin/components/admin-list-layout"
import type { UserDirectoryDetails, UserDirUser } from "@/features/admin/types"
import { formatShortDate } from "@/lib/formatters"
import { formatStatusLabel } from "@/lib/status"
import { buildTimelineEntries, type TimelineEntry } from "./userDirectoryTimeline"

type UserActivityTimelineProps = {
  details: UserDirectoryDetails | null
  isLoading: boolean
  selectedUser: UserDirUser
}

const TIMELINE_ROWS_PER_PAGE = 5

export function UserActivityTimeline({ details, isLoading, selectedUser }: UserActivityTimelineProps) {
  const [timelinePage, setTimelinePage] = useState(1)
  const [timelineSearch, setTimelineSearch] = useState("")
  const [timelineTypeFilter, setTimelineTypeFilter] = useState("")
  const [timelineStatusFilter, setTimelineStatusFilter] = useState("")
  const entries = useMemo(() => buildTimelineEntries(details), [details])
  const filteredEntries = useMemo(() => {
    const query = timelineSearch.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesSearch = !query || [
        entry.title,
        entry.subtitle,
        entry.status,
        entry.type,
        formatShortDate(entry.createdAt),
      ].some((value) => value.toLowerCase().includes(query))
      const matchesType = !timelineTypeFilter || entry.type === timelineTypeFilter
      const matchesStatus = !timelineStatusFilter || entry.status === timelineStatusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [entries, timelineSearch, timelineTypeFilter, timelineStatusFilter])
  const statusOptions = useMemo(() => Array.from(new Set(entries.map((entry) => entry.status))).sort(), [entries])
  const timelinePageCount = Math.max(1, Math.ceil(filteredEntries.length / TIMELINE_ROWS_PER_PAGE))
  const safeTimelinePage = Math.min(timelinePage, timelinePageCount)
  const visibleEntries = filteredEntries.slice((safeTimelinePage - 1) * TIMELINE_ROWS_PER_PAGE, safeTimelinePage * TIMELINE_ROWS_PER_PAGE)
  const deniedOrClosedClaims = details?.claims.filter((claim) => ["DENIED", "CANCELLED", "EXPIRED"].includes(claim.status)).length ?? 0
  const rejectedReports = details?.reports.filter((report) => report.status === "REJECTED").length ?? 0
  const riskCount = deniedOrClosedClaims + rejectedReports

  useEffect(() => {
    setTimelinePage(1)
  }, [details?.id])

  useEffect(() => {
    setTimelinePage(1)
  }, [timelineSearch, timelineTypeFilter, timelineStatusFilter])

  return (
    <div className="border-t border-slate-200 pt-6 flex-1 min-h-0 flex flex-col">
      <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Activity Timeline</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Recent claims, reports, handovers, and account actions for {selectedUser.name}.
          </p>
        </div>
        <div className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${riskCount > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {riskCount > 0 ? `${riskCount} review signal${riskCount === 1 ? "" : "s"}` : "No review signals"}
        </div>
      </div>

      <div className="pb-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_180px] gap-3">
        <AdminSearchInput placeholder="Search activity..." value={timelineSearch} onChange={setTimelineSearch} />
        <Select
          value={timelineTypeFilter}
          onChange={(event) => setTimelineTypeFilter(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-bold"
        >
          <option value="">All Activity</option>
          <option value="claim">Claims</option>
          <option value="report">Reports</option>
          <option value="handover">Handovers</option>
          <option value="audit">Account Actions</option>
        </Select>
        <Select
          value={timelineStatusFilter}
          onChange={(event) => setTimelineStatusFilter(event.target.value)}
          className="h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm font-bold"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {formatStatusLabel(status)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <TimelineSkeleton />
        ) : entries.length === 0 ? (
          <EmptyState icon={<History className="w-10 h-10" />} title="No activity recorded yet." />
        ) : filteredEntries.length === 0 ? (
          <EmptyState icon={<History className="w-10 h-10" />} title="No activity matches those filters." />
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide pr-1">
              {visibleEntries.map((entry) => (
                <TimelineRow key={`${entry.type}-${entry.id}`} entry={entry} />
              ))}
            </div>
            <PaginationControls
              page={safeTimelinePage}
              pageCount={timelinePageCount}
              total={filteredEntries.length}
              visibleCount={visibleEntries.length}
              rowsPerPage={TIMELINE_ROWS_PER_PAGE}
              onPageChange={setTimelinePage}
              onRowsPerPageChange={() => {}}
              showRowsPerPage={false}
              itemLabel="activities"
              className="p-3 bg-white border-t border-slate-200 shrink-0"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`timeline-skeleton-${index}`} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-2.5 w-36" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mt-0.5 h-9 w-9 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
        {timelineIcon(entry.type)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-sm font-bold text-slate-900 truncate">{entry.title}</p>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            {formatShortDate(entry.createdAt)}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{entry.subtitle}</p>
      </div>
      <StatusBadge status={formatStatusLabel(entry.status)} className="hidden lg:inline-flex px-2.5 py-1 text-[9px]" />
    </div>
  )
}

function timelineIcon(type: TimelineEntry["type"]) {
  if (type === "claim") return <AlertCircle className="w-4 h-4" />
  if (type === "report") return <PackageSearch className="w-4 h-4" />
  if (type === "handover") return <History className="w-4 h-4" />
  return <ShieldAlert className="w-4 h-4" />
}
