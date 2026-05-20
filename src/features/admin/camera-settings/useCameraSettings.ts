import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import type { CampusCamera } from "@/features/admin/cameras/types"
import { cameraMatchesSearch } from "./cameraSettingsUtils"

export function useCameraSettings() {
  const [cameras, setCameras] = useState<CampusCamera[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState<CampusCamera | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [cameraToEdit, setCameraToEdit] = useState<CampusCamera | null>(null)

  const loadCameras = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const response = await api.get<{ cameras: CampusCamera[] }>("/cameras")
      setCameras(response.data.cameras)
    } catch {
      if (!silent) alert("Failed to load cameras")
    } finally {
      setIsLoading(false)
      if (!silent) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadCameras()
    const intervalId = window.setInterval(() => {
      void loadCameras(true)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [loadCameras])

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

  const toggleStream = async (id: string, streamEnabled: boolean) => {
    try {
      setCameras((prev) => prev.map((camera) => camera.id === id ? {
        ...camera,
        streamEnabled,
        isOnline: streamEnabled ? camera.isOnline : false,
        streamStatus: streamEnabled ? "CONNECTING" : "OFFLINE",
      } : camera))
      const response = await api.patch<{ camera: CampusCamera }>(`/cameras/${id}/stream`, { streamEnabled })
      setCameras((prev) => prev.map((camera) => camera.id === id ? response.data.camera : camera))
      if (streamEnabled) {
        await requestCameraReconnect(id)
      }
      void loadCameras(true)
    } catch {
      alert("Failed to update camera stream")
      void loadCameras(true)
    }
  }

  const handleAddCamera = async (data: { name: string; location: string; sourceUrl: string }) => {
    const response = await api.post<{ camera: CampusCamera }>("/cameras", data)
    setCameras((prev) => [...prev, response.data.camera])
    setIsAddModalOpen(false)
    await requestCameraReconnect(response.data.camera.id)
    void loadCameras(true)
  }

  const saveCameraDetails = async (camera: CampusCamera, data: { name: string; location: string; sourceUrl: string }) => {
    const response = await api.patch<{ camera: CampusCamera }>(`/cameras/${camera.id}`, data)
    setCameras((prev) => prev.map((entry) => entry.id === camera.id ? response.data.camera : entry))
    setCameraToEdit(null)
    await requestCameraReconnect(camera.id)
    void loadCameras(true)
  }

  const restartCamera = async (camera: CampusCamera) => {
    const response = await requestCameraReconnect(camera.id)
    setCameras((prev) => prev.map((entry) => entry.id === camera.id ? response.data.camera : entry))
    void loadCameras(true)
  }

  const requestCameraReconnect = (cameraId: string) => (
    api.post<{ camera: CampusCamera; daemonAccepted: boolean }>(`/cameras/${cameraId}/restart`)
  )

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
    isRefreshing,
    refreshCameras: loadCameras,
    cameraToDelete,
    setCameraToDelete,
    isDeleting,
    isAddModalOpen,
    setIsAddModalOpen,
    cameraToEdit,
    setCameraToEdit,
    toggleStream,
    toggleAi,
    handleAddCamera,
    saveCameraDetails,
    restartCamera,
    confirmDeleteCamera,
  }
}
