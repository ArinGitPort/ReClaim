import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import {
  Bell,
  Building,
  CheckCircle2,
  Database,
  Laptop,
  Loader2,
  Mail,
  Map,
  Phone,
  Plus,
  Save,
  Shield,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

type SettingsTab = "general" | "roles" | "zones" | "alerts" | "retention"

type SystemSettings = {
  institution: {
    institutionName: string
    supportEmail: string
    phone: string
  }
  roles: {
    allowStaffManageInventory: boolean
    allowStaffManageClaims: boolean
    allowStaffViewReports: boolean
    requireAdminForSettings: boolean
  }
  campusZones: string[]
  alertTemplates: {
    claimApproved: string
    claimDenied: string
    inquiryRequired: string
  }
  retentionPolicy: {
    foundItemRetentionDays: number
    dismissedSnapshotRetentionDays: number
    auditLogRetentionDays: number
  }
}

type SettingsResponse = {
  settings: SystemSettings
  integrations: {
    computerVision: {
      status: "online" | "idle" | "not_configured"
      totalCameras: number
      aiEnabledCameras: number
      onlineCameras: number
      lastPingAtUtc?: string | null
    }
  }
}

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Building }> = [
  { id: "general", label: "General System", icon: Building },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "zones", label: "Campus Zones", icon: Map },
  { id: "alerts", label: "Alert Templates", icon: Bell },
  { id: "retention", label: "Retention Policy", icon: Database },
]

const fallbackSettings: SystemSettings = {
  institution: {
    institutionName: "University of Technology",
    supportEmail: "lostandfound@university.edu",
    phone: "+1 (555) 123-4567",
  },
  roles: {
    allowStaffManageInventory: true,
    allowStaffManageClaims: true,
    allowStaffViewReports: true,
    requireAdminForSettings: true,
  },
  campusZones: ["Main Library", "Gym", "Cafeteria", "Student Union", "Engineering Building", "Science Building", "Admin Office"],
  alertTemplates: {
    claimApproved: "Your claim has been approved. Please prepare your pickup token and campus ID.",
    claimDenied: "Your claim could not be verified. Please review the administrator note for details.",
    inquiryRequired: "We need more details before we can verify your claim.",
  },
  retentionPolicy: {
    foundItemRetentionDays: 90,
    dismissedSnapshotRetentionDays: 30,
    auditLogRetentionDays: 365,
  },
}

export function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [integrations, setIntegrations] = useState<SettingsResponse["integrations"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoneDraft, setZoneDraft] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<SystemSettings>({
    defaultValues: fallbackSettings,
  })

  const campusZones = watch("campusZones")
  const visionStatus = integrations?.computerVision.status ?? "not_configured"
  const visionStatusLabel = visionStatus === "online" ? "Online" : visionStatus === "idle" ? "Idle" : "Not Configured"

  const navDescription = useMemo(() => {
    if (activeTab === "general") return "Primary details used across the Lost & Found portal."
    if (activeTab === "roles") return "Administrative switches used to document staff access policy."
    if (activeTab === "zones") return "Campus locations shown to staff while logging and reviewing items."
    if (activeTab === "alerts") return "Reusable copy for common claim notification states."
    return "Retention windows for system records and automated evidence."
  }, [activeTab])

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
      { shouldDirty: true }
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Configure campus zones, notification copy, integrations, and access policy.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        <div className="xl:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition-colors",
                  isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{tabs.find((tab) => tab.id === activeTab)?.label}</h3>
                <p className="text-sm text-slate-500 mt-1">{navDescription}</p>
              </div>
              {isSaved && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="p-10 flex items-center gap-3 text-slate-500 font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading system settings...
              </div>
            ) : (
              <>
                {activeTab === "general" && (
                  <form onSubmit={saveGeneral} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Institution Name" icon={<Building className="w-4 h-4" />}>
                        <input type="text" {...register("institution.institutionName")} className={inputClassName} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Support Email" icon={<Mail className="w-4 h-4" />}>
                        <input type="email" {...register("institution.supportEmail")} className={inputClassName} />
                      </Field>
                      <Field label="Central Office Phone" icon={<Phone className="w-4 h-4" />}>
                        <input type="tel" {...register("institution.phone")} className={inputClassName} />
                      </Field>
                    </div>
                    <SaveButton isSubmitting={isSubmitting} />
                  </form>
                )}

                {activeTab === "roles" && (
                  <form onSubmit={saveRoles} className="p-6 space-y-4">
                    <Toggle label="Staff can manage inventory" description="Staff may create, edit, archive, and restore found item records." registration={register("roles.allowStaffManageInventory")} />
                    <Toggle label="Staff can review claims" description="Staff may approve, deny, or request more information for item claims." registration={register("roles.allowStaffManageClaims")} />
                    <Toggle label="Staff can view reports" description="Staff may access missing-item reports and claim history." registration={register("roles.allowStaffViewReports")} />
                    <Toggle label="Only admins can edit settings" description="System settings remain restricted to administrator accounts." registration={register("roles.requireAdminForSettings")} />
                    <SaveButton isSubmitting={isSubmitting} />
                  </form>
                )}

                {activeTab === "zones" && (
                  <form onSubmit={saveZones} className="p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={zoneDraft}
                        onChange={(event) => setZoneDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            addZone()
                          }
                        }}
                        placeholder="Add campus zone"
                        className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <Button type="button" onClick={addZone} className="h-11 bg-brand hover:bg-brand-active text-white font-bold rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Zone
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {campusZones.map((zone) => (
                        <div key={zone} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <span className="text-sm font-bold text-slate-800">{zone}</span>
                          <button type="button" onClick={() => removeZone(zone)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <SaveButton isSubmitting={isSubmitting} />
                  </form>
                )}

                {activeTab === "alerts" && (
                  <form onSubmit={saveAlerts} className="p-6 space-y-4">
                    <Textarea label="Claim Approved" registration={register("alertTemplates.claimApproved")} />
                    <Textarea label="Claim Denied" registration={register("alertTemplates.claimDenied")} />
                    <Textarea label="Inquiry Required" registration={register("alertTemplates.inquiryRequired")} />
                    <SaveButton isSubmitting={isSubmitting} />
                  </form>
                )}

                {activeTab === "retention" && (
                  <form onSubmit={saveRetention} className="p-6 space-y-4">
                    <NumberField label="Found Item Retention Days" registration={register("retentionPolicy.foundItemRetentionDays", { valueAsNumber: true })} />
                    <NumberField label="Dismissed Snapshot Retention Days" registration={register("retentionPolicy.dismissedSnapshotRetentionDays", { valueAsNumber: true })} />
                    <NumberField label="Audit Log Retention Days" registration={register("retentionPolicy.auditLogRetentionDays", { valueAsNumber: true })} />
                    <SaveButton isSubmitting={isSubmitting} />
                  </form>
                )}

                {error && <div className="mx-6 mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">System Integrations</h3>
              <p className="text-sm text-slate-500 mt-1">Connected automated processing services.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Computer Vision AI</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {integrations
                        ? `${integrations.computerVision.aiEnabledCameras}/${integrations.computerVision.totalCameras} cameras AI-enabled`
                        : "Auto-tagging and sorting engine"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full", visionStatus === "online" ? "text-green-600 bg-green-50" : visionStatus === "idle" ? "text-amber-600 bg-amber-50" : "text-slate-500 bg-slate-100")}>
                    <span className={cn("w-2 h-2 rounded-full", visionStatus === "online" ? "bg-green-500" : visionStatus === "idle" ? "bg-amber-500" : "bg-slate-400")} />
                    {visionStatusLabel}
                  </span>
                  <Button type="button" variant="outline" onClick={() => navigate("/admin/camera-settings")} className="h-9 px-4 rounded-lg border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClassName =
  "w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm font-semibold text-slate-900"

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">{label}</span>
      <span className="relative block">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        {children}
      </span>
    </label>
  )
}

function Toggle({
  label,
  description,
  registration,
}: {
  label: string
  description: string
  registration: UseFormRegisterReturn
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
      <span>
        <span className="block text-sm font-bold text-slate-900">{label}</span>
        <span className="block text-xs font-medium text-slate-500 mt-1">{description}</span>
      </span>
      <input type="checkbox" {...registration} className="mt-1 h-5 w-5 accent-brand" />
    </label>
  )
}

function Textarea({ label, registration }: { label: string; registration: UseFormRegisterReturn }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">{label}</span>
      <textarea
        {...registration}
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  )
}

function NumberField({ label, registration }: { label: string; registration: UseFormRegisterReturn }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">{label}</span>
      <input
        type="number"
        min={1}
        {...registration}
        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  )
}

function SaveButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="pt-2 flex justify-end">
      <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 h-11 px-8 rounded-xl bg-brand text-white text-sm font-bold shadow-sm hover:bg-brand-active transition-colors disabled:opacity-70">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}

function readError(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as { error?: string } | undefined)?.error ?? fallback
  }

  return fallback
}
