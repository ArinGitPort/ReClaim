import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react"
import { Link } from "react-router-dom"
import { formatCompactDateTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { OperationsData, OperationsQueueItem, OperationsQueueKey } from "./types"

type AttentionItem = OperationsQueueItem & {
  queueKey: OperationsQueueKey
}

const queueLabels: Record<OperationsQueueKey, string> = {
  pendingClaims: "Claim",
  approvedPickups: "Pickup",
  activeReports: "Report",
  pendingSnapshots: "AI Review",
  cameraHealth: "Camera",
  messageFollowUps: "Message",
}

export function NeedsAttentionPanel({ operations }: { operations: OperationsData }) {
  const urgentItems = getAttentionItems(operations)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[340px]">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center border",
            urgentItems.length > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
          )}>
            {urgentItems.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Needs Attention</h3>
        </div>
        {urgentItems.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
            {urgentItems.length} urgent
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
        {urgentItems.length > 0 ? (
          urgentItems.map((item) => <AttentionRow key={`${item.queueKey}-${item.id}`} item={item} />)
        ) : (
          <AllClearState />
        )}
      </div>
    </div>
  )
}

function AttentionRow({ item }: { item: AttentionItem }) {
  return (
    <Link
      to={item.route}
      className="flex items-start gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50/80 transition-colors"
    >
      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Clock3 className="w-4 h-4 text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-extrabold font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">{item.code}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{queueLabels[item.queueKey]}</span>
        </div>
        <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
        <p className="text-[11px] font-medium text-slate-500 truncate">{item.nextAction}</p>
        {item.dueAt && (
          <p className="text-[10px] font-bold text-amber-700 mt-1 uppercase tracking-widest">
            {formatCompactDateTime(item.dueAt)}
          </p>
        )}
      </div>
      <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest text-amber-600">Open</span>
    </Link>
  )
}

function AllClearState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 mb-3">
        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
      </div>
      <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">All clear - no urgent<br />operations need attention.</p>
    </div>
  )
}

function getAttentionItems(operations: OperationsData): AttentionItem[] {
  return (Object.entries(operations.queues) as Array<[OperationsQueueKey, OperationsQueueItem[]]>)
    .flatMap(([queueKey, rows]) => rows
      .filter((row) => row.urgency === "high")
      .map((row) => ({ ...row, queueKey })))
    .sort((left, right) => {
      if (!left.dueAt && !right.dueAt) return 0
      if (!left.dueAt) return 1
      if (!right.dueAt) return -1
      return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
    })
    .slice(0, 5)
}
