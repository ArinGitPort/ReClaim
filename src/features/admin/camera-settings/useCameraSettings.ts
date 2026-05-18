import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import type { CameraZoneConfig, CampusCamera } from "@/features/admin/cameras/types"
import { cameraMatchesSearch } from "./cameraSettingsUtils"

export function useCameraSettings() {
  const [cameras, setCameras] = useState<CampusCamera[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [, setIsLoading] = useState(true)
  const [cameraToDelete, setCameraToDelete] = useState<CampusCamera | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [cameraToConfigure, setCameraToConfigure] = useState<CampusCamera | null>(null)

  const loadCameras = async () => {
    try {
      const response = await api.get<{ cameras: CampusCamera[] }>("/cameras")
      setCameras(response.data.cameras)
    } catch {
      alert("Failed to load cameras")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCameras()
  }, [])

  const filteredCameras = useMemo(
    () => cameras.filter((camera) => cameraMatchesSearch(camera, searchQuery)),
    [cameras, searchQuery],
  )

  const toggleAi = async (id: string, newAiState: boolean) => {
    try {
      setCameras((prev) => prev.map((camera) => camera.id === id ? { ...camera, aiEnabled: newAiState } : camera))
      await api.patch(`/cameras/${id}/ai`, { aiEnabled: newAiState })
    } catch {
      alert("Failed to update AI state")
      setCameras((prev) => prev.map((camera) => camera.id === id ? { ...camera, aiEnabled: !newAiState } : camera))
    }
  }

  const handleAddCamera = async (data: { name: string; location: string; sourceUrl: string }) => {
    const response = await api.post<{ camera: CampusCamera }>("/cameras", data)
    setCameras((prev) => [...prev, response.data.camera])
    setIsAddModalOpen(false)
  }

  const saveCameraZones = async (camera: CampusCamera, zoneConfig: CameraZoneConfig | null) => {
    const response = await api.patch<{ camera: CampusCamera }>(`/cameras/${camera.id}/zones`, { zoneConfig })
    setCameras((prev) => prev.map((entry) => entry.id === camera.id ? response.data.camera : entry))
    setCameraToConfigure(null)
  }

  const confirmDeleteCamera = async () => {
    if (!cameraToDelete) return
    setIsDeleting(true)
    try {
      await api.delete(`/cameras/${cameraToDelete.id}`)
      setCameras((prev) => prev.filter((camera) => camera.id !== cameraToDelete.id))
      setCameraToDelete(null)
    } catch {
      alert("Failed to delete camera")
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    cameras,
    filteredCameras,
    searchQuery,
    setSearchQuery,
    cameraToDelete,
    setCameraToDelete,
    isDeleting,
    isAddModalOpen,
    setIsAddModalOpen,
    cameraToConfigure,
    setCameraToConfigure,
    toggleAi,
    handleAddCamera,
    saveCameraZones,
    confirmDeleteCamera,
  }
}
