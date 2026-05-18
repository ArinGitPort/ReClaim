import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { AddCameraModal } from "@/features/admin/components/AddCameraModal"
import {
  CameraSettingsFilters,
  CameraSettingsTable,
  CameraZoneModal,
  useCameraSettings,
} from "@/features/admin/camera-settings"

export function CameraSettingsPage() {
  const cameras = useCameraSettings()

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Camera Settings"
        description="Manage physical camera units and AI detection model settings."
        actions={(
          <Button onClick={() => cameras.setIsAddModalOpen(true)} className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none">
            <Plus className="w-4 h-4 mr-2" />
            Add New Camera
          </Button>
        )}
      />

      <CameraSettingsFilters
        searchQuery={cameras.searchQuery}
        visibleCount={cameras.filteredCameras.length}
        onSearchChange={cameras.setSearchQuery}
      />

      <CameraSettingsTable
        cameras={cameras.filteredCameras}
        onToggleAi={cameras.toggleAi}
        onDeleteClick={cameras.setCameraToDelete}
        onConfigureZones={cameras.setCameraToConfigure}
      />

      <AddCameraModal
        isOpen={cameras.isAddModalOpen}
        onClose={() => cameras.setIsAddModalOpen(false)}
        onSubmit={cameras.handleAddCamera}
      />

      <CameraZoneModal
        camera={cameras.cameraToConfigure}
        onClose={() => cameras.setCameraToConfigure(null)}
        onSave={cameras.saveCameraZones}
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
    </div>
  )
}
