import { useEffect, useState } from "react"
import {
  TrendingUp,
  AlertCircle,
  Package,
  FileCheck,
  Search,
  Camera,
  Activity,
  Clock,
  User,
  MoreHorizontal,
  MessageSquareWarning,
  Archive,
  BarChart3,
  ArrowRight,
  ClipboardCheck,
  Hourglass,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { Link } from "react-router-dom"

type DashboardData = {
  metrics: {
    activeInventory: number
    pendingClaims: number
    activeSearches: number
    activeCameras: number
  }
  inventoryBreakdown: {
    available: number
    claimPending: number
    returned: number
    archived: number
  }
  lostReportBreakdown: {
    submitted: number
    underReview: number
    activeSearch: number
    matched: number
    resolved: number
    rejected: number
  }
  inquiryClaims: Array<{
    id: string
    claimCode: string
    foundItem: { code: string; title: string }
    claimantUser: { name: string; email: string }
    updatedAt: string
  }>
  recentMatches: Array<{
    id: string
    reportCode: string
    title: string
    matchedItemId: string
    matchedItem?: { code: string }
    reporterUser: { name: string; email: string }
    updatedAt: string
  }>
  recentActivity: Array<{
    id: string
    action: string
    createdAt: string
    actorUser: { name: string; role: string }
  }>
}

type OperationsQueueKey =
  | "pendingClaims"
  | "inquiryClaims"
  | "approvedPickups"
  | "activeReports"
  | "pendingSnapshots"
  | "expiredInventory"

type OperationsQueueItem = {
  id: string
  code: string
  title: string
  subjectCode?: string | null
  status: string
  ownerName: string
  route: string
  dueAt?: string | null
  urgency: "high" | "normal"
  nextAction: string
}

type OperationsData = {
  counts: {
    pendingClaims: number
    inquiryClaims: number
    approvedPickups: number
    activeReports: number
    pendingSnapshots: number
    expiredInventory: number
    nearRetentionInventory: number
  }
  retentionPolicy: {
    foundItemRetentionDays: number
  }
  queues: Record<OperationsQueueKey, OperationsQueueItem[]>
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [operations, setOperations] = useState<OperationsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, operationsResponse] = await Promise.all([
          api.get<DashboardData>("/dashboard"),
          api.get<OperationsData>("/dashboard/operations"),
        ])
        setData(dashboardResponse.data)
        setOperations(operationsResponse.data)
      } catch (err) {
        console.error("Failed to load dashboard metrics", err)
      } finally {
        setIsLoading(false)
      }
    }
    void fetchDashboard()
  }, [])

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Dashboard</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Real-time system performance and audit tracking.</p>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-200">
          <Activity className="w-6 h-6 text-brand animate-pulse" />
        </div>
      ) : data ? (
        <>
          {/* Row 1 — 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              icon={<Package className="w-5 h-5 text-brand" />}
              label="Available Inventory"
              value={data.metrics.activeInventory.toString()}
              trend="Secure storage"
              color="brand"
            />
            <MetricCard
              icon={<FileCheck className="w-5 h-5 text-emerald-600" />}
              label="Pending Claims"
              value={data.metrics.pendingClaims.toString()}
              trend="Awaiting verification"
              color="emerald"
              alert={data.metrics.pendingClaims > 0}
            />
            <MetricCard
              icon={<Search className="w-5 h-5 text-amber-600" />}
              label="Active Searches"
              value={data.metrics.activeSearches.toString()}
              trend="Open lost reports"
              color="amber"
            />
            <MetricCard
              icon={<Camera className="w-5 h-5 text-blue-600" />}
              label="Active Feeds"
              value={data.metrics.activeCameras.toString()}
              trend="Camera health status"
              color="blue"
            />
          </div>

          {/* Row 2 — Lost Reports Overview */}
          {operations && <OperationsQueue operations={operations} />}

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Lost Reports Overview</h3>
              <span className="ml-auto text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Total: {Object.values(data.lostReportBreakdown).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {([
                { label: "Submitted", key: "submitted", color: "bg-slate-400", text: "text-slate-600", ring: "ring-slate-200", bg: "bg-slate-50" },
                { label: "Under Review", key: "underReview", color: "bg-blue-400", text: "text-blue-600", ring: "ring-blue-100", bg: "bg-blue-50" },
                { label: "Active Search", key: "activeSearch", color: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-100", bg: "bg-amber-50" },
                { label: "Matched", key: "matched", color: "bg-brand", text: "text-brand", ring: "ring-brand/20", bg: "bg-brand/5" },
                { label: "Resolved", key: "resolved", color: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-100", bg: "bg-emerald-50" },
                { label: "Rejected", key: "rejected", color: "bg-rose-500", text: "text-rose-600", ring: "ring-rose-100", bg: "bg-rose-50" },
              ] as const).map(({ label, key, color, text, ring, bg }) => {
                const count = data.lostReportBreakdown[key]
                const total = Object.values(data.lostReportBreakdown).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={key} className={cn("rounded-xl p-4 border flex flex-col gap-3", bg, `ring-1 ${ring} border-transparent`)}>
                    <div className="flex items-center justify-between">
                      <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
                      <span className="text-[10px] font-extrabold text-slate-400">{pct}%</span>
                    </div>
                    <div>
                      <p className={cn("text-2xl font-extrabold tracking-tight", text)}>{count}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/60">
                      <div
                        className={cn("h-1.5 rounded-full transition-all duration-700", color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Row 3 — Match Alerts + Activity Feed */}
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
                            <span className="text-slate-400 text-xs">•</span>
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

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[400px]">
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
                      <p className="text-xs font-bold text-slate-800 truncate mb-0.5">
                        {log.action.replaceAll("_", " ")}
                      </p>
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
          </div>

          {/* Row 4 — Inquiry Required + Inventory Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-amber-200/60 shadow-sm flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
                    <MessageSquareWarning className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Inquiry Required</h3>
                </div>
                {data.inquiryClaims.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                    {data.inquiryClaims.length} pending
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
                {data.inquiryClaims.length > 0 ? (
                  data.inquiryClaims.map((claim) => (
                    <div key={claim.id} className="flex items-start gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50/80 transition-colors">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <FileCheck className="w-4 h-4 text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-extrabold font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">{claim.claimCode}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate">{claim.foundItem.title}</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">{claim.claimantUser.name} · {claim.claimantUser.email}</p>
                      </div>
                      <Link
                        to="/admin/claims"
                        className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 mb-3">
                      <FileCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">All clear — no claims<br />require inquiry.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[340px]">
              <div className="flex items-center gap-2 mb-6 shrink-0">
                <div className="w-7 h-7 bg-brand/5 border border-brand/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-brand" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Inventory Health</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {([
                  { label: "Available", count: data.inventoryBreakdown.available, color: "bg-brand", textColor: "text-brand" },
                  { label: "Claim Pending", count: data.inventoryBreakdown.claimPending, color: "bg-amber-500", textColor: "text-amber-600" },
                  { label: "Returned", count: data.inventoryBreakdown.returned, color: "bg-emerald-500", textColor: "text-emerald-600" },
                  { label: "Archived", count: data.inventoryBreakdown.archived, color: "bg-slate-400", textColor: "text-slate-500" },
                ] as const).map(({ label, count, color, textColor }) => {
                  const total = data.inventoryBreakdown.available + data.inventoryBreakdown.claimPending + data.inventoryBreakdown.returned + data.inventoryBreakdown.archived
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", color)} />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-extrabold", textColor)}>{count}</span>
                          <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn("h-2 rounded-full transition-all duration-700", color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Items</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800">
                    {data.inventoryBreakdown.available + data.inventoryBreakdown.claimPending + data.inventoryBreakdown.returned + data.inventoryBreakdown.archived}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

const operationsSections: Array<{
  key: OperationsQueueKey
  title: string
  description: string
  icon: React.ReactNode
  route: string
}> = [
  {
    key: "pendingClaims",
    title: "Claim Reviews",
    description: "Proof waiting for staff decision",
    icon: <ClipboardCheck className="w-4 h-4" />,
    route: "/admin/claims",
  },
  {
    key: "inquiryClaims",
    title: "Student Follow-Up",
    description: "Claims waiting on more details",
    icon: <MessageSquareWarning className="w-4 h-4" />,
    route: "/admin/claims?status=INQUIRY_REQUIRED",
  },
  {
    key: "approvedPickups",
    title: "Ready for Pickup",
    description: "Approved claims awaiting handover",
    icon: <FileCheck className="w-4 h-4" />,
    route: "/admin/inventory?status=CLAIM_PENDING",
  },
  {
    key: "activeReports",
    title: "Lost Reports",
    description: "Reports needing review or matching",
    icon: <Search className="w-4 h-4" />,
    route: "/admin/reports",
  },
  {
    key: "pendingSnapshots",
    title: "AI Snapshots",
    description: "Detected items awaiting review",
    icon: <ImageIcon className="w-4 h-4" />,
    route: "/admin/snapshots",
  },
  {
    key: "expiredInventory",
    title: "Expired Inventory",
    description: "Retention window exceeded",
    icon: <Archive className="w-4 h-4" />,
    route: "/admin/expired-inventory",
  },
]

function OperationsQueue({ operations }: { operations: OperationsData }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-brand" />
            Operations Queue
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Next-action worklist for claims, reports, AI review, and retention. Item retention is set to {operations.retentionPolicy.foundItemRetentionDays} days.
          </p>
        </div>
        {operations.counts.nearRetentionInventory > 0 && (
          <Link
            to="/admin/inventory"
            className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700"
          >
            {operations.counts.nearRetentionInventory} nearing retention expiry
          </Link>
        )}
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
                  )}>
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

function MetricCard({
  icon,
  label,
  value,
  trend,
  color,
  alert = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  trend: string
  color: string
  alert?: boolean
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:border-slate-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm",
          color === "brand" ? "bg-brand/5 border border-brand/10" :
          color === "amber" ? "bg-amber-50 border border-amber-100" :
          color === "emerald" ? "bg-emerald-50 border border-emerald-100" :
          "bg-blue-50 border border-blue-100"
        )}>
          {icon}
        </div>
        {alert && <div className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/10 animate-pulse" />}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        <p className={`text-[9px] font-extrabold tracking-widest uppercase mt-2 ${alert ? "text-amber-600" : "text-slate-400"}`}>{trend}</p>
      </div>
    </div>
  )
}
