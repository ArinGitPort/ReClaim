import { Camera, FileCheck, Package, Search } from "lucide-react"
import { MetricCard } from "./MetricCard"
import type { DashboardData } from "./types"

export function DashboardMetricGrid({ data }: { data: DashboardData }) {
  return (
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
  )
}
