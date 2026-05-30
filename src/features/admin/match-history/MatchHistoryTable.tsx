import { AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { cn } from "@/lib/utils"
import { Eye, Link } from "lucide-react"
import type { ReportRow } from "@/features/admin/missing-items/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/Skeleton"

type MatchHistoryTableProps = {
  reports: ReportRow[]
  isLoading: boolean
  onSelectReport: (report: ReportRow) => void
}

export function MatchHistoryTable({ reports, isLoading, onSelectReport }: MatchHistoryTableProps) {
  return (
    <AdminTableContainer>
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
            <th className="px-8 py-5">Report Date</th>
            <th className="px-8 py-5">Report Record</th>
            <th className="px-8 py-5">Linked Inventory</th>
            <th className="px-8 py-5">Match Status</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
              <td className="px-8 py-5 text-xs font-semibold text-slate-600">{report.date}</td>
              <td className="px-8 py-5">
                <div className="text-xs font-bold text-slate-800">{report.code}</div>
                <div className="text-xs font-semibold text-slate-500">{report.item} {"\u2022"} {report.category}</div>
              </td>
              <td className="px-8 py-5">
                {report.linkedItem ? (
                  <>
                    <div className="text-xs font-bold text-slate-800">{report.linkedItem.code}</div>
                    <div className="text-xs font-semibold text-slate-500">{report.linkedItem.title} {"\u2022"} {report.linkedItem.category}</div>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-slate-400 italic">No linked item</span>
                )}
              </td>
              <td className="px-8 py-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200/50 text-[10px] font-bold text-emerald-700 tracking-widest uppercase">
                  <Link className="w-3 h-3" />
                  Matched
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSelectReport(report)}
                  className="h-8 border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                </Button>
              </td>
            </tr>
          ))}
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-8 py-4">
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </td>
            </tr>
          )}
          {!isLoading && reports.length === 0 && (
            <tr>
              <td colSpan={5} className="px-8 py-14 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                  <Link className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1">No matches found</p>
                <p className="text-xs font-medium text-slate-500">There are currently no reports in the matched state.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminTableContainer>
  )
}
