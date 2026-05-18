import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { CampusCamera, LiveMonitorViewMode, RecentSnapshot } from "./types"

export function useLiveMonitor() {
  const [cameras, setCameras] = useState<CampusCamera[]>([])
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState<LiveMonitorViewMode>("grid")
  const [activeCamId, setActiveCamId] = useState<string | null>(null)
  const [recentSnapshots, setRecentSnapshots] = useState<RecentSnapshot[]>([])
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
    time,
    focusCamera,
  }
}
