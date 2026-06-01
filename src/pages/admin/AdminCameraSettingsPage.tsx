import { useState } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { api } from "@/lib/api"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AdminExportButton } from "@/features/admin/components/AdminExportButton"
import { AddCameraModal } from "@/features/admin/components/AddCameraModal"
import {
  CameraSettingsFilters,
  CameraSettingsGrid,
  useCameraSettings,
} from "@/features/admin/camera-settings"
import { StartAiServiceConfirmModal, useAiServiceStatus, type AiServiceStatus } from "@/features/admin/live-monitor"
import { formatExportDate } from "@/lib/exportUtils"

export function CameraSettingsPage() {
  const cameras = useCameraSettings()
  const { aiService, setAiService } = useAiServiceStatus(5000)
  const [isServiceUpdating, setIsServiceUpdating] = useState(false)
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false)
  const isServiceRunning = Boolean(aiService?.running)

  async function setCameraServiceRunning(running: boolean) {
    setIsServiceUpdating(true)
    try {
      const response = await api.post<{ aiService: AiServiceStatus }>(`/ai-service/${running ? "start" : "stop"}`)
      setAiService(response.data.aiService)
      void cameras.refreshCameras(true)
    } catch {
      setAiService((current) => ({
        running: false,
        managed: false,
        pid: null,
        streamBaseUrl: current?.streamBaseUrl ?? "",
        activeCameras: [],
        model: null,
        device: null,
        cudaAvailable: null,
        error: running ? "Unable to start camera service." : "Unable to stop camera service.",
      }))
    } finally {
      setIsServiceUpdating(false)
    }
  }

  function handleCameraServiceToggle() {
    if (isServiceRunning) {
      void setCameraServiceRunning(false)
      return
    }

    setIsStartConfirmOpen(true)
  }

  async function confirmStartCameraService() {
    await setCameraServiceRunning(true)
    setIsStartConfirmOpen(false)
  }

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Camera Settings"
        description="Manage physical camera units and AI detection model settings."
        actions={(
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              disabled={isServiceUpdating}
              onClick={handleCameraServiceToggle}
              className={`flex-1 sm:flex-initial h-10 px-4 text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm ${
                isServiceRunning
                  ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                  : "border-none bg-brand text-white hover:bg-brand-active"
              }`}
            >
              {isServiceUpdating ? "Updating..." : isServiceRunning ? "Stop Camera Service" : "Start Camera Service"}
            </Button>
            <div className="flex flex-col gap-2 sm:ml-3 sm:flex-row sm:border-l sm:border-slate-200 sm:pl-5">
              <AdminExportButton
                title="Camera Settings Export"
                filename="reclaim-camera-settings"
                disabled={!cameras.filteredCameras.length}
                filters={[{ label: "Search", value: cameras.searchQuery || "All" }]}
                fetchRows={async () => cameras.filteredCameras}
                getRowDate={(camera) => camera.lastFrameAtUtc ?? camera.lastPingAtUtc}
                columns={[
                  { header: "Code", getValue: (camera) => camera.code },
                  { header: "Name", getValue: (camera) => camera.name },
                  { header: "Location", getValue: (camera) => camera.location },
                  { header: "Online", getValue: (camera) => camera.isOnline ? "Yes" : "No" },
                  { header: "Stream Enabled", getValue: (camera) => camera.streamEnabled ? "Yes" : "No" },
                  { header: "AI Enabled", getValue: (camera) => camera.aiEnabled ? "Yes" : "No" },
                  { header: "Status", getValue: (camera) => camera.streamStatus },
                  { header: "Last Frame", getValue: (camera) => formatExportDate(camera.lastFrameAtUtc) },
                  { header: "Last Ping", getValue: (camera) => formatExportDate(camera.lastPingAtUtc) },
                  { header: "Source URL", getValue: (camera) => camera.sourceUrl, sensitive: true },
                  { header: "Last Error", getValue: (camera) => camera.lastError },
                ]}
                sensitiveDescription="This camera export can include source URLs. Continue only if the file will be kept internal."
              />
              <Button
                onClick={() => void cameras.refreshCameras(false)}
                variant="outline"
                disabled={cameras.isRefreshing}
                className="flex-1 sm:flex-initial h-10 px-4 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold rounded-xl shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${cameras.isRefreshing ? "animate-spin" : ""}`} />
                Refresh All
              </Button>
              <Button onClick={() => cameras.setIsAddModalOpen(true)} className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none">
                <Plus className="w-4 h-4 mr-2" />
                Add New Camera
              </Button>
            </div>
          </div>
        )}
      />

      <CameraSettingsFilters
        searchQuery={cameras.searchQuery}
        visibleCount={cameras.filteredCameras.length}
        onSearchChange={cameras.setSearchQuery}
      />

      <CameraSettingsGrid
        cameras={cameras.filteredCameras}
        onToggleStream={cameras.toggleStream}
        onToggleAi={cameras.toggleAi}
        onEditClick={cameras.setCameraToEdit}
        onRetryClick={(camera) => void cameras.restartCamera(camera)}
        onDeleteClick={cameras.setCameraToDelete}
      />

      <AddCameraModal
        isOpen={cameras.isAddModalOpen}
        onClose={() => cameras.setIsAddModalOpen(false)}
        onSubmit={cameras.handleAddCamera}
      />

      <AddCameraModal
        isOpen={Boolean(cameras.cameraToEdit)}
        onClose={() => cameras.setCameraToEdit(null)}
        title="Edit Camera"
        submitText="Save Changes"
        initialValues={cameras.cameraToEdit}
        onSubmit={async (data) => {
          if (!cameras.cameraToEdit) return
          await cameras.saveCameraDetails(cameras.cameraToEdit, data)
        }}
      />

      <ConfirmModal
        isOpen={Boolean(cameras.cameraToDelete)}
        onClose={() => !cameras.isDeleting && cameras.setCameraToDelete(null)}
        onConfirm={cameras.confirmDeleteCamera}
        title="Delete Camera"
        message={`Are you sure you want to delete ${cameras.cameraToDelete?.name}? This action cannot be undone and will stop AI detection for this location.`}
        confirmText="Delete Camera"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={cameras.isDeleting}
      />

      <StartAiServiceConfirmModal
        isOpen={isStartConfirmOpen}
        isLoading={isServiceUpdating}
        onClose={() => {
          if (!isServiceUpdating) setIsStartConfirmOpen(false)
        }}
        onConfirm={() => void confirmStartCameraService()}
      />
    </div>
  )
}
