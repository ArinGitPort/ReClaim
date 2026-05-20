import { useState } from "react"
import { Activity } from "lucide-react"
import {
  DashboardMetricGrid,
  DashboardViewToggle,
  type DashboardView,
  LostReportsOverview,
  OperationalHealthPanels,
  OperationsQueue,
  RecentDashboardPanels,
  useDashboard,
} from "@/features/admin/dashboard"

export function DashboardPage() {
  const { data, operations, isLoading } = useDashboard()
  const [view, setView] = useState<DashboardView>("operations")

  return (
    <div className="space-y-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {view === "operations"
              ? "Work through the highest-priority claims, reports, snapshots, and handovers."
              : "Review system performance, trends, and audit activity."}
          </p>
        </div>
        <DashboardViewToggle value={view} onChange={setView} />
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-200">
          <Activity className="w-6 h-6 text-brand animate-pulse" />
        </div>
      ) : data ? (
        view === "operations" ? (
          <>
            {operations && <OperationsQueue operations={operations} />}
            {operations && <OperationalHealthPanels data={data} operations={operations} />}
          </>
        ) : (
          <>
            <DashboardMetricGrid data={data} />
            <LostReportsOverview data={data} />
            <RecentDashboardPanels data={data} />
          </>
        )
      ) : null}
    </div>
  )
}
