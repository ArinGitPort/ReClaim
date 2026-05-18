import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AiServiceStatus, CampusCamera, LiveMonitorViewMode, RecentSnapshot } from "./types"
import { useAiServiceStatus } from "./useAiServiceStatus"

export function useLiveMonitor() {
  const [cameras, setCameras] = useState<CampusCamera[]>([])
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState<LiveMonitorViewMode>("grid")
  const [activeCamId, setActiveCamId] = useState<string | null>(null)
  const [recentSnapshots, setRecentSnapshots] = useState<RecentSnapshot[]>([])
  const { aiService, setAiService } = useAiServiceStatus(5000)
  const [isAiServiceUpdating, setIsAiServiceUpdating] = useState(false)
  const [isStartAiConfirmOpen, setIsStartAiConfirmOpen] = useState(false)
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await api.get<{ cameras: CampusCamera[] }>("/cameras")
        setCameras(res.data.cameras)
        if (res.data.cameras.length > 0 && !activeCamId) {
          setActiveCamId(res.data.cameras[0].id)
        }
      } catch (err) {
        console.error("Failed to fetch cameras:", err)
      }
    }

    void fetchCameras()
    const interval = window.setInterval(fetchCameras, 10000)
    return () => window.clearInterval(interval)
  }, [activeCamId])

  const fetchRecentSnapshots = useCallback(async () => {
    try {
      const res = await api.get<{ snapshots: RecentSnapshot[] }>("/snapshots")
      setRecentSnapshots(res.data.snapshots.slice(0, 20))
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    void fetchRecentSnapshots()
    const interval = window.setInterval(fetchRecentSnapshots, 15000)
    return () => window.clearInterval(interval)
  }, [fetchRecentSnapshots])

  const activeCam = cameras.find((camera) => camera.id === activeCamId) || cameras[0]
  const uniqueLocations = Array.from(new Set(cameras.map((camera) => camera.location).filter(Boolean)))
  const filteredCameras = filter === "all" ? cameras : cameras.filter((camera) => camera.location === filter)

  function updateFilter(nextFilter: string) {
    setFilter(nextFilter)
    setViewMode("grid")
  }

  function focusCamera(cameraId: string) {
    setActiveCamId(cameraId)
    setViewMode("focus")
  }

  async function setAiServiceRunning(running: boolean) {
    setIsAiServiceUpdating(true)
    try {
      const response = await api.post<{ aiService: AiServiceStatus }>(`/ai-service/${running ? "start" : "stop"}`)
      setAiService(response.data.aiService)
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
        error: running ? "Unable to start AI service." : "Unable to stop AI service.",
      }))
    } finally {
      setIsAiServiceUpdating(false)
    }
  }

  function requestAiServiceToggle(running: boolean) {
    if (running) {
      setIsStartAiConfirmOpen(true)
      return
    }

    void setAiServiceRunning(false)
  }

  async function confirmStartAiService() {
    await setAiServiceRunning(true)
    setIsStartAiConfirmOpen(false)
  }

  function closeStartAiConfirm() {
    if (!isAiServiceUpdating) {
      setIsStartAiConfirmOpen(false)
    }
  }

  return {
    cameras,
    filter,
    setFilter: updateFilter,
    viewMode,
    setViewMode,
    activeCamId,
    setActiveCamId,
    activeCam,
    filteredCameras,
    uniqueLocations,
    recentSnapshots,
    aiService,
    isAiServiceUpdating,
    isStartAiConfirmOpen,
    time,
    focusCamera,
    setAiServiceRunning,
    requestAiServiceToggle,
    confirmStartAiService,
    closeStartAiConfirm,
  }
}
