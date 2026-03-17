import { useEffect, useState } from "react"
import { TopNavBar } from "@/layouts/TopNavBar"
import { FileText, Calendar, MapPin, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"

interface ReportView {
  id: string
  item: string
  category: string
  dateFiled: string
  location: string
  status: string
}

export function MyReportsPage() {
  const [reports, setReports] = useState<ReportView[]>([])

  useEffect(() => {
    async function loadReports(): Promise<void> {
      const response = await api.get<{
        reports: Array<{
          reportCode: string
          title: string
          category: string
          location: string
          createdAt: string
          status: string
        }>
      }>("/reports")

      setReports(
        response.data.reports.map((report) => ({
          id: report.reportCode,
          item: report.title,
          category: report.category,
          location: report.location,
          dateFiled: new Date(report.createdAt).toLocaleDateString(),
          status: report.status.replaceAll("_", " "),
        }))
      )
    }

    void loadReports()
  }, [])

  return (
    <div className="w-full min-h-full pb-24">
      <TopNavBar title="My Lost Reports" />
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Tracking & Status</h2>
            <p className="text-slate-500 text-sm">View the items you reported lost and their search status.</p>
          </div>
          <Link
            to="/report-lost"
            className="flex items-center gap-2 text-sm font-bold text-brand hover:underline"
          >
            File New Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-slate-400" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                    {report.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                    {report.category}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{report.item}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {report.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Filed {report.dateFiled}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <ReportStatusBadge status={report.status} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Admin is reviewing your report
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReportStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Submitted": "bg-blue-50 text-blue-700 border-blue-100",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-100",
    "Active Search": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Resolved": "bg-slate-50 text-slate-500 border-slate-100",
    "Rejected": "bg-rose-50 text-rose-700 border-rose-100",
  }

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-flex items-center gap-1.5",
      styles[status] ?? "bg-slate-50 text-slate-600 border-slate-100"
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}
