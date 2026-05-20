import { Activity, AlertCircle, Clock, MoreHorizontal, TrendingUp, User } from "lucide-react"
import { Link } from "react-router-dom"
import type { DashboardData } from "./types"

export function RecentDashboardPanels({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand" />
            Recent Match Alerts
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 pb-2">
          {data.recentMatches.length > 0 ? (
            <div className="space-y-4">
              {data.recentMatches.map((match) => (
                <div key={match.id} className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-emerald-500 w-2 h-2 rounded-full ring-4 ring-emerald-500/20" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">Matched Report</span>
                      <span className="text-slate-400 text-xs">{"\u2022"}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {new Date(match.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{match.title}</h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Report {match.reportCode} matched with {match.matchedItem?.code ?? "an Item"}
                    </p>
                  </div>
                  <div className="text-right sm:ml-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reporter</p>
                    <p className="text-xs font-bold text-slate-800">{match.reporterUser.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 mb-4">
                <TrendingUp className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">No high-probability matches<br />detected recently.</p>
            </div>
          )}
        </div>
      </div>

      <RecentActivityPanel data={data} />
    </div>
  )
}

export function RecentActivityPanel({ data, className = "" }: { data: DashboardData; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[400px] ${className}`}>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Recent Activity</h3>
        </div>
        <Link to="/admin/logs" className="p-1 text-slate-400 hover:text-brand transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide pl-2 pr-2 space-y-4">
        {data.recentActivity.length > 0 ? (
          data.recentActivity.map((log) => (
            <div key={log.id} className="relative pl-4 border-l-2 border-slate-100 pb-4 last:pb-0 last:border-transparent">
              <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-brand ring-4 ring-white" />
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate mb-0.5">{log.action.replaceAll("_", " ")}</p>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-500 truncate">
                  {log.actorUser.name}{" "}
                  <span className="uppercase text-[9px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded ml-1">
                    {log.actorUser.role}
                  </span>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-sm font-semibold text-center mt-10">No recent system activity.</div>
        )}
      </div>
    </div>
  )
}
