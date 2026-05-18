import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { AxiosError } from "axios"
import { api } from "@/lib/api"
import { fallbackSettings, getSettingsTabDescription, settingsTabs } from "./settingsConfig"
import type { SettingsResponse, SettingsTab, SystemSettings } from "./types"

export function useSystemSettings(activeTab: SettingsTab) {
  const [integrations, setIntegrations] = useState<SettingsResponse["integrations"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoneDraft, setZoneDraft] = useState("")

  const form = useForm<SystemSettings>({
    defaultValues: fallbackSettings,
  })

  const { handleSubmit, reset, setValue, watch } = form
  const campusZones = watch("campusZones")

  const activeTabLabel = settingsTabs.find((tab) => tab.id === activeTab)?.label ?? "System Settings"
  const activeTabDescription = useMemo(() => getSettingsTabDescription(activeTab), [activeTab])

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<SettingsResponse>("/settings")
      setIntegrations(response.data.integrations)
      reset(response.data.settings)
    } catch (err) {
      setError(readError(err, "Unable to load system settings."))
    } finally {
      setIsLoading(false)
    }
  }, [reset])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  async function saveSettings(payload: Partial<SystemSettings>) {
    setError(null)

    try {
      const response = await api.patch<{ settings: SystemSettings }>("/settings", payload)
      reset(response.data.settings)
      setIsSaved(true)
      window.setTimeout(() => setIsSaved(false), 2500)
    } catch (err) {
      setError(readError(err, "Unable to save system settings."))
    }
  }

  const saveGeneral = handleSubmit((data) => saveSettings({ institution: data.institution }))
  const saveRoles = handleSubmit((data) => saveSettings({ roles: data.roles }))
  const saveAlerts = handleSubmit((data) => saveSettings({ alertTemplates: data.alertTemplates }))
  const saveRetention = handleSubmit((data) => saveSettings({ retentionPolicy: data.retentionPolicy }))
  const saveZones = handleSubmit((data) => saveSettings({ campusZones: data.campusZones }))

  function addZone() {
    const nextZone = zoneDraft.trim()
    if (!nextZone || campusZones.some((zone) => zone.toLowerCase() === nextZone.toLowerCase())) {
      return
    }

    setValue("campusZones", [...campusZones, nextZone], { shouldDirty: true })
    setZoneDraft("")
  }

  function removeZone(zoneToRemove: string) {
    setValue(
      "campusZones",
      campusZones.filter((zone) => zone !== zoneToRemove),
      { shouldDirty: true },
    )
  }

  return {
    form,
    integrations,
    isLoading,
    isSaved,
    error,
    zoneDraft,
    setZoneDraft,
    campusZones,
    activeTabLabel,
    activeTabDescription,
    saveGeneral,
    saveRoles,
    saveAlerts,
    saveRetention,
    saveZones,
    addZone,
    removeZone,
  }
}

function readError(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as { error?: string } | undefined)?.error ?? fallback
  }

  return fallback
}
