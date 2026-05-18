import { Calendar, FileSearch, User } from "lucide-react"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { cn } from "@/lib/utils"
import { reportNextAction } from "./reportStatus"
import type { ReportRow } from "./types"

type MissingReportsQueueProps = {
  reports: ReportRow[]
  isLoading: boolean
  selectedReportId: string | null
  focusCode: string
  searchQuery: string
  categoryFilter: string
  page: number
  pageCount: number
  totalReports: number
  rowsPerPage: number
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSelectReport: (id: string) => void
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}

const categoryFilters = ["All", "Electronics", "Wallets/IDs", "Everyday Items"]

export function MissingReportsQueue({
  reports,
  isLoading,
  selectedReportId,
  focusCode,
  searchQuery,
  categoryFilter,
  page,
  pageCount,
  totalReports,
  rowsPerPage,
  onSearchChange,
  onCategoryChange,
  onSelectReport,
  onPageChange,
  onRowsPerPageChange,
}: MissingReportsQueueProps) {
  return (
    <div className="xl:col-span-4 space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative group">
          <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
          {categoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm",
                category === categoryFilter
                  ? "bg-brand text-white border-brand shadow-brand/20"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 active:scale-95"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <button
            type="button"
            key={report.id}
            onClick={() => onSelectReport(report.id)}
            className={cn(
              "w-full text-left p-5 bg-white rounded-2xl border transition-all cursor-pointer group shadow-sm relative overflow-hidden",
              selectedReportId === report.id
                ? "border-brand ring-2 ring-brand/10 scale-[1.01] shadow-sm"
                : "border-slate-100 hover:border-brand/20 hover:shadow-sm",
              report.code.toUpperCase() === focusCode && "ring-2 ring-brand/30 border-brand/50"
            )}
          >
            {selectedReportId === report.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand" />}

            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {report.code}
              </span>
              <StatusBadge status={report.status} />
            </div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand">
              {reportNextAction(report.status)}
            </div>
            <h4 className="font-bold text-slate-800 text-[15px] mb-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
              {report.item}
            </h4>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-4 shrink-0">
              <User className="w-3 h-3 text-slate-300 shrink-0" />
              {report.student}
            </div>
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-brand/60 bg-brand/5 -mx-5 -mb-5 px-5 py-2.5 mt-auto">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {report.date}
              </div>
              <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-brand/10">{report.category}</span>
            </div>
          </button>
        ))}

        {isLoading && (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold">
            Loading reports...
          </div>
        )}
        {!isLoading && reports.length === 0 && (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold">
            No active reports in triage queue.
          </div>
        )}

        <PaginationControls
          page={page}
          pageCount={pageCount}
          total={totalReports}
          visibleCount={reports.length}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          itemLabel="reports"
        />
      </div>
    </div>
  )
}
