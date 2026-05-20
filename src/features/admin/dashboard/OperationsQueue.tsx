import type { ReactNode } from "react"
import { ArrowRight, ClipboardCheck, FileCheck, Hourglass, ImageIcon, MessageSquare, Search, Video } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { OperationsData, OperationsQueueKey } from "./types"

const operationsSections: Array<{
  key: OperationsQueueKey
  title: string
  description: string
  icon: ReactNode
  route: string
}> = [
  { key: "pendingClaims", title: "Claim Reviews", description: "Proof waiting for staff decision", icon: <ClipboardCheck className="w-4 h-4" />, route: "/admin/claims" },
  { key: "activeReports", title: "Lost Reports", description: "Reports needing review or matching", icon: <Search className="w-4 h-4" />, route: "/admin/reports" },
  { key: "approvedPickups", title: "Ready for Pickup", description: "Approved claims awaiting handover", icon: <FileCheck className="w-4 h-4" />, route: "/admin/inventory?status=CLAIM_PENDING" },
  { key: "pendingSnapshots", title: "AI Snapshots", description: "Detected items awaiting review", icon: <ImageIcon className="w-4 h-4" />, route: "/admin/snapshots" },
  { key: "cameraHealth", title: "Camera Health", description: "Offline or errored cameras", icon: <Video className="w-4 h-4" />, route: "/admin/camera-settings" },
  { key: "messageFollowUps", title: "Message Follow-Ups", description: "Unread claim and report chats", icon: <MessageSquare className="w-4 h-4" />, route: "/admin/claims" },
]

export function OperationsQueue({ operations }: { operations: OperationsData }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-brand" />
            Operations Queue
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Next-action worklist for claims, reports, AI review, and handover readiness.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {operationsSections.map((section) => {
          const rows = operations.queues[section.key]
          const count = operations.counts[section.key]
          const urgentCount = rows.filter((row) => row.urgency === "high").length

          return (
            <div key={section.key} className="p-5 min-h-[260px]">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center border",
                    urgentCount > 0 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-brand/5 text-brand border-brand/10"
                  )}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{section.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-500">{section.description}</p>
                  </div>
                </div>
                <Link to={section.route} className="text-[10px] font-black text-brand uppercase tracking-widest hover:text-brand-active">
                  {count}
                </Link>
              </div>

              <div className="space-y-2">
                {rows.length > 0 ? (
                  rows.slice(0, 3).map((row) => (
                    <Link
                      key={row.id}
                      to={row.route}
                      className={cn(
                        "block rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm",
                        row.urgency === "high" ? "border-amber-200 bg-amber-50/70" : "border-slate-100 bg-slate-50/60 hover:border-brand/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black font-mono text-slate-500">{row.code}</span>
                            {row.urgency === "high" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{row.title}</p>
                          <p className="text-[11px] font-semibold text-slate-500 truncate">{row.ownerName}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-widest">
                        <span className={row.urgency === "high" ? "text-amber-700" : "text-brand"}>{row.nextAction}</span>
                        {row.dueAt && <span className="text-slate-400">{formatQueueDate(row.dueAt)}</span>}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">All clear</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">No queued work here.</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatQueueDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}
