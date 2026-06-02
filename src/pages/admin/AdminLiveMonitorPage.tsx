import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import {
  CameraMonitorPanel,
  LiveMonitorHeaderActions,
  LiveMonitorToolbar,
  RecentDetectionsPanel,
  StartAiServiceConfirmModal,
  useLiveMonitor,
} from "@/features/admin/live-monitor"
import { formatExportDate } from "@/lib/exportUtils"

export function LiveMonitorPage() {
  const monitor = useLiveMonitor()

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <AdminListHeader
        title="Live Monitor"
        description="Real-time multi-camera detection feed and analysis."
        actions={(
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <AdminExportButton
              title="Live Monitor Camera Export"
              filename="reclaim-live-monitor-cameras"
              disabled={!monitor.filteredCameras.length}
              filters={[{ label: "Location", value: monitor.filter === "all" ? "All" : monitor.filter }]}
              fetchRows={async () => monitor.filteredCameras}
              getRowDate={(camera) => camera.lastFrameAtUtc ?? camera.lastPingAtUtc}
              columns={[
                { header: "Code", getValue: (camera) => camera.code },
                { header: "Name", getValue: (camera) => camera.name },
                { header: "Location", getValue: (camera) => camera.location },
                { header: "Online", getValue: (camera) => camera.isOnline ? "Yes" : "No" },
                { header: "AI Enabled", getValue: (camera) => camera.aiEnabled ? "Yes" : "No" },
                { header: "Stream Status", getValue: (camera) => camera.streamStatus },
                { header: "Last Frame", getValue: (camera) => formatExportDate(camera.lastFrameAtUtc) },
                { header: "Last Error", getValue: (camera) => camera.lastError },
              ]}
            />
            <LiveMonitorHeaderActions
              filter={monitor.filter}
              uniqueLocations={monitor.uniqueLocations}
              aiService={monitor.aiService}
              isAiServiceUpdating={monitor.isAiServiceUpdating}
              onFilterChange={monitor.setFilter}
              onToggleAiService={monitor.requestAiServiceToggle}
            />
          </div>
        )}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          <LiveMonitorToolbar
            viewMode={monitor.viewMode}
            time={monitor.time}
            aiService={monitor.aiService}
            onViewModeChange={monitor.setViewMode}
          />

          <CameraMonitorPanel
            cameras={monitor.cameras}
            filteredCameras={monitor.filteredCameras}
            activeCam={monitor.activeCam}
            activeCamId={monitor.activeCamId}
            viewMode={monitor.viewMode}
            time={monitor.time}
            serviceRunning={Boolean(monitor.aiService?.running)}
            activeCameraIds={monitor.aiService?.activeCameras ?? []}
            onFocusCamera={monitor.focusCamera}
            onSelectCamera={monitor.setActiveCamId}
          />
        </div>

        <RecentDetectionsPanel snapshots={monitor.recentSnapshots} />
      </div>

      <StartAiServiceConfirmModal
        isOpen={monitor.isStartAiConfirmOpen}
        isLoading={monitor.isAiServiceUpdating}
        onClose={monitor.closeStartAiConfirm}
        onConfirm={() => void monitor.confirmStartAiService()}
      />
    </div>
  )
}
