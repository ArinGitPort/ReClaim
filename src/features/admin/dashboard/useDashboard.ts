import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { DashboardData, OperationsData } from "./types"

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [operations, setOperations] = useState<OperationsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, operationsResponse] = await Promise.all([
          api.get<DashboardData>("/dashboard"),
          api.get<OperationsData>("/dashboard/operations"),
        ])
        setData(dashboardResponse.data)
        setOperations(operationsResponse.data)
      } catch (err) {
        console.error("Failed to load dashboard metrics", err)
      } finally {
        setIsLoading(false)
      }
    }
    void fetchDashboard()
  }, [])

  return { data, operations, isLoading }
}
