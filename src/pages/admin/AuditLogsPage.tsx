import { History as HistoryIcon, Globe, Filter, ShieldCheck, Search, Database, Lock as LockIcon, Zap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"

const MOCK_LOGS = [
  { id: "LOG-003", event: "Claim Approved", user: "Admin (admin@reclaim.ph)", role: "System Admin", timestamp: "2024-03-16 12:04:12", ip: "192.168.1.1", status: "Success" },
  { id: "LOG-004", event: "Config Updated", user: "System", role: "Automated Service", timestamp: "2024-03-16 13:00:00", ip: "localhost", status: "System" },
  { id: "LOG-005", event: "Report Rejected", user: "Staff (staff_02)", role: "Frontdesk Staff", timestamp: "2024-03-16 13:45:22", ip: "192.168.1.8", status: "Access Denied" },
]

export function AuditLogsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Audit Archive</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Permanent record of system interactions and admin decisions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl px-4">
            <Filter className="w-4 h-4 mr-2" />
            Filter Logs
          </Button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
          <Input 
            placeholder="Search by Event, User, or Transaction ID..." 
            className="pl-12 h-12 bg-white border-slate-200 shadow-sm focus:ring-brand/10 rounded-xl font-medium text-sm" 
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-12 border-slate-200 bg-white rounded-xl shadow-sm px-6 font-bold uppercase tracking-widest text-xs text-slate-500 hover:text-brand">
            <Filter className="w-4 h-4 mr-2" /> Status: All
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-400">
                <th className="px-8 py-5">Event Identifier</th>
                <th className="px-8 py-5">Action Specifications</th>
                <th className="px-8 py-5">Initiator</th>
                <th className="px-8 py-5">Network Origin</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 group-hover:bg-slate-100 group-hover:text-slate-900 transition-all">
                      {log.id}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <EventIcon event={log.event} />
                      <span className="font-semibold text-slate-900 text-sm leading-tight">{log.event}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-0.5">
                      <div className="font-bold text-slate-900 tracking-tight">{log.user}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.role}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/50 text-[11px] font-bold text-slate-400 font-mono tracking-tight group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Globe className="w-3 h-3" />
                      {log.ip}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <LogStatusBadge status={log.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="text-[12px] font-bold text-slate-400 font-mono tracking-tighter whitespace-nowrap">
                      {log.timestamp}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Integrity Alert */}
      <div className="p-8 bg-brand rounded-3xl text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 transform translate-x-8 -translate-y-8 opacity-10 group-hover:opacity-20 transition-all rotate-12">
           <Database className="w-48 h-48" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
           <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
           </div>
           <div className="space-y-1 flex-1">
              <h4 className="text-xl font-extrabold tracking-tight uppercase">Ledger Integrity Verified</h4>
              <p className="text-white/70 text-sm font-medium">All logs are tamper-proof and cryptographically hashed for institutional accountability.</p>
           </div>
           <Button className="h-12 px-10 bg-white text-brand hover:bg-slate-100 font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 rounded-xl shadow-sm">
              Verify Chain Hash
           </Button>
        </div>
      </div>
    </div>
  )
}

function EventIcon({ event }: { event: string }) {
  if (event.includes("Login")) return <LockIcon className="w-4 h-4 text-amber-500" />
  if (event.includes("Item")) return <Database className="w-4 h-4 text-blue-500" />
  if (event.includes("Update")) return <Zap className="w-4 h-4 text-emerald-500" />
  return <HistoryIcon className="w-4 h-4 text-slate-400" />
}

function LogStatusBadge({ status }: { status: string }) {
  const getStyles = () => {
    switch(status) {
      case 'Success': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'Access Denied': return 'bg-rose-50 text-rose-700 border-rose-100'
      case 'System': return 'bg-slate-100 text-slate-700 border-slate-200'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm",
      getStyles()
    )}>
      {status}
    </span>
  )
}
