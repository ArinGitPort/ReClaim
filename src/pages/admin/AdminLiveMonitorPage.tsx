import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import {
  CameraMonitorPanel,
  LiveMonitorHeaderActions,
  LiveMonitorToolbar,
  RecentDetectionsPanel,
  StartAiServiceConfirmModal,
  useLiveMonitor,
} from "@/features/admin/live-monitor"

export function LiveMonitorPage() {
  const monitor = useLiveMonitor()

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <AdminListHeader
        title="Live Monitor"
        description="Real-time multi-camera detection feed and analysis."
        actions={(
          <LiveMonitorHeaderActions
            filter={monitor.filter}
            uniqueLocations={monitor.uniqueLocations}
            aiService={monitor.aiService}
            isAiServiceUpdating={monitor.isAiServiceUpdating}
            onFilterChange={monitor.setFilter}
            onToggleAiService={monitor.requestAiServiceToggle}
          />
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
