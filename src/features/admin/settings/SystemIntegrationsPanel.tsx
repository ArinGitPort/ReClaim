import { Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SettingsResponse } from "./types"

type SystemIntegrationsPanelProps = {
  integrations: SettingsResponse["integrations"] | null
  onConfigureVision: () => void
}

export function SystemIntegrationsPanel({ integrations, onConfigureVision }: SystemIntegrationsPanelProps) {
  const visionStatus = integrations?.computerVision.status ?? "not_configured"
  const visionStatusLabel = visionStatus === "online" ? "Online" : visionStatus === "idle" ? "Idle" : "Not Configured"

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">System Integrations</h3>
        <p className="text-sm text-slate-500 mt-1">Connected automated processing services.</p>
      </div>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Computer Vision AI</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {integrations
                  ? `${integrations.computerVision.aiEnabledCameras}/${integrations.computerVision.totalCameras} cameras AI-enabled`
                  : "Auto-tagging and sorting engine"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full", visionStatus === "online" ? "text-green-600 bg-green-50" : visionStatus === "idle" ? "text-amber-600 bg-amber-50" : "text-slate-500 bg-slate-100")}>
              <span className={cn("w-2 h-2 rounded-full", visionStatus === "online" ? "bg-green-500" : visionStatus === "idle" ? "bg-amber-500" : "bg-slate-400")} />
              {visionStatusLabel}
            </span>
            <Button type="button" variant="outline" onClick={onConfigureVision} className="h-9 px-4 rounded-lg border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
