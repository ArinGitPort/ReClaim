import { 
  TrendingUp, 
  ShieldCheck,
  ArrowUpRight,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

const metrics: Array<{ icon: React.ReactNode; label: string }> = []

export function DashboardPage() {
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
            value="--"
            trend="No analytics data"
            color="brand"
          />
        ))}
        {metrics.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold">
            No analytics records available.
          </div>
        )}
      </div>

      {/* Bottom Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-brand" />
              Recent Match Alerts
            </h3>
            <button className="text-[10px] font-bold text-brand hover:underline uppercase tracking-widest flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <TrendingUp className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm tracking-tight uppercase mt-4">No high-probability matches detected in the last 24 hours.</p>
          </div>
        </div>

        {/* Service Health Section - Simplified */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">AI Service Health</h3>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200">NO DATA</span>
          </div>
          
          <div className="space-y-6">
            <div className="text-slate-500 text-sm font-semibold">No AI health metrics available.</div>
          </div>
        </div>
      </div>
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

