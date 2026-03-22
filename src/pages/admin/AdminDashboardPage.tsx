import { 
  TrendingUp, 
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  Package,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

const metrics = [
  { 
    icon: <Package className="w-5 h-5 text-brand" />, 
    label: "Total Inventory", 
    value: "1,284", 
    trend: "+12 this week", 
    color: "brand" 
  },
  { 
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, 
    label: "Items Returned", 
    value: "842", 
    trend: "65% Success Rate", 
    color: "emerald" 
  },
  { 
    icon: <Users className="w-5 h-5 text-blue-500" />, 
    label: "Active Users", 
    value: "4,102", 
    trend: "+156 new signups", 
    color: "blue" 
  },
  { 
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />, 
    label: "Pending Claims", 
    value: "28", 
    trend: "Needs Review", 
    color: "amber",
    alert: true
  }
]

const recentMatches = [
  { id: 1, item: "MacBook Air M2", owner: "Sarah Jenkins", match: "98%", time: "2h ago" },
  { id: 2, item: "Blue Hydroflask", owner: "Mike Peterson", match: "85%", time: "5h ago" },
  { id: 3, item: "Sony Headphones", owner: "David Lee", match: "92%", time: "1d ago" },
]

export function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Consistent Header Pattern */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Real-time system performance and audit tracking.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            color={metric.color}
            alert={metric.alert}
          />
        ))}
      </div>

      {/* Bottom Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" />
              High-Confidence Match Alerts
            </h3>
            <button className="text-[10px] font-bold text-brand hover:underline uppercase tracking-widest flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentMatches.map(match => (
              <div key={match.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                    {match.match}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{match.item}</h4>
                    <p className="text-xs text-slate-500 font-medium">Claimant: {match.owner}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{match.time}</span>
                  <div className="mt-1 flex gap-2">
                    <button className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">Verify</button>
                    <button className="text-[10px] font-bold text-slate-400 uppercase hover:underline">Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Platform Integrity</h3>
            </div>
          </div>
          
          <div className="space-y-6">
            <HealthItem label="Database Latency" value="24ms" status="OPTIMAL" />
            <HealthItem label="Image Storage" value="1.2 TB / 5 TB" status="STABLE" />
            <HealthItem label="API Response" value="112ms" status="HEALTHY" />
            <HealthItem label="Real-time Socket" value="CONNECTED" status="ACTIVE" />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Maintenance</p>
            <p className="text-xs font-semibold text-slate-700">March 20, 2026 - All systems operational.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthItem({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md border border-emerald-100">
        {status}
      </span>
    </div>
  )
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  trend, 
  color, 
  alert = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:border-slate-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm",
          color === 'brand' ? 'bg-brand/5 border border-brand/10' :
          color === 'amber' ? 'bg-amber-50 border border-amber-100' :
          color === 'emerald' ? 'bg-emerald-50 border border-emerald-100' :
          'bg-blue-50 border border-blue-100'
        )}>
          {icon}
        </div>
        {alert && <div className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h4>
        <p className={`text-[11px] font-bold uppercase tracking-tight ${alert ? 'text-amber-600' : 'text-slate-400'}`}>{trend}</p>
      </div>
    </div>
  )
}

