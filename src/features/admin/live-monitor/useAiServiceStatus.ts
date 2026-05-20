import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AiServiceStatus } from "./types"

export function useAiServiceStatus(intervalMs = 10000) {
  const [aiService, setAiService] = useState<AiServiceStatus | null>(null)

  const fetchAiServiceStatus = useCallback(async () => {
    try {
      const response = await api.get<{ aiService: AiServiceStatus }>("/ai-service/status")
      setAiService(response.data.aiService)
    } catch {
      setAiService((current) => current ?? {
        running: false,
        managed: false,
        pid: null,
        streamBaseUrl: "",
        activeCameras: [],
        model: null,
        device: null,
        cudaAvailable: null,
        error: "Unable to reach camera service controller.",
      })
    }
  }, [])

  useEffect(() => {
    void fetchAiServiceStatus()
    const interval = window.setInterval(fetchAiServiceStatus, intervalMs)
    return () => window.clearInterval(interval)
  }, [fetchAiServiceStatus, intervalMs])

  return {
    aiService,
    refreshAiServiceStatus: fetchAiServiceStatus,
    setAiService,
  }
}
