import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import type { DashboardData, OperationsData } from "./types"

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [operations, setOperations] = useState<OperationsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchDashboard = async (silent = false) => {
      if (!silent) setIsLoading(true)
      try {
        const [dashboardResponse, operationsResponse] = await Promise.all([
          api.get<DashboardData>("/dashboard"),
          api.get<OperationsData>("/dashboard/operations"),
        ])
        if (!isMounted) return
        setData(dashboardResponse.data)
        setOperations(operationsResponse.data)
      } catch (err) {
        console.error("Failed to load dashboard metrics", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void fetchDashboard()

    const intervalId = window.setInterval(() => {
      void fetchDashboard(true)
    }, 15000)

    const socket = getRealtimeSocket()
    const refresh = () => void fetchDashboard(true)
    socket?.on("claim.status.updated", refresh)
    socket?.on("claim.message.created", refresh)
    socket?.on("item.updated", refresh)
    socket?.on("report.status.updated", refresh)
    socket?.on("notification.created", refresh)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      socket?.off("claim.status.updated", refresh)
      socket?.off("claim.message.created", refresh)
      socket?.off("item.updated", refresh)
      socket?.off("report.status.updated", refresh)
      socket?.off("notification.created", refresh)
    }
  }, [])

  return { data, operations, isLoading }
}
