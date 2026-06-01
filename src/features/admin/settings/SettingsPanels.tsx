import { useState, type FormEvent } from "react"
import { AlertTriangle, Building, CheckCircle2, LockKeyhole, Mail, Phone, Plus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { adminNavItems, dailyOperationsPermissions, sensitiveAdminPermissions, type AdminPermission } from "@/lib/adminPermissions"
import { cn } from "@/lib/utils"
import {
  SettingsField,
  SettingsNumberField,
  SettingsSaveButton,
  SettingsTextarea,
  settingsInputClassName,
} from "./SettingsFormPrimitives"
import type { SystemSettings } from "./types"

type SettingsPanelProps = {
  form: UseFormReturn<SystemSettings>
  onSubmit: () => void | Promise<void>
}

type RolesSettingsPanelProps = SettingsPanelProps & {
  onApplyToExistingStaff: () => void | Promise<void>
  isApplyingStaffDefaults: boolean
  staffDefaultsAppliedCount: number | null
}

export function GeneralSettingsPanel({ form, onSubmit }: SettingsPanelProps) {
  const { register, formState: { isSubmitting } } = form

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <SettingsField label="Institution Name" icon={<Building className="w-4 h-4" />}>
          <input type="text" {...register("institution.institutionName")} className={settingsInputClassName} />
        </SettingsField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingsField label="Support Email" icon={<Mail className="w-4 h-4" />}>
          <input type="email" {...register("institution.supportEmail")} className={settingsInputClassName} />
        </SettingsField>
        <SettingsField label="Central Office Phone" icon={<Phone className="w-4 h-4" />}>
          <input type="tel" {...register("institution.phone")} className={settingsInputClassName} />
        </SettingsField>
      </div>
      <SettingsSaveButton isSubmitting={isSubmitting} />
    </form>
  )
}

export function RolesSettingsPanel({
  form,
  onSubmit,
  onApplyToExistingStaff,
  isApplyingStaffDefaults,
  staffDefaultsAppliedCount,
}: RolesSettingsPanelProps) {
  const { setValue, watch, formState: { isSubmitting } } = form
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)
  const [confirmApplyOpen, setConfirmApplyOpen] = useState(false)
  const selectedPermissions = watch("roles.defaultStaffPermissions") ?? []
  const requireAdminForSettings = watch("roles.requireAdminForSettings")
  const selectedCriticalCount = selectedPermissions.filter((permission) => sensitiveAdminPermissions.includes(permission)).length
  const systemSettingsLocked = requireAdminForSettings
  const hasNoPermissions = selectedPermissions.length === 0

  const presets: Array<{ label: string; description: string; permissions: AdminPermission[] }> = [
    { label: "Daily Ops", description: "Front-desk and recovery workflow access.", permissions: dailyOperationsPermissions },
    { label: "Verification Desk", description: "Claims, reports, matching, and handover only.", permissions: ["DASHBOARD", "REPORTS", "CLAIMS", "HANDOVER_LOG", "MATCH_HISTORY"] },
    { label: "AI Review", description: "Camera monitoring and snapshot review access.", permissions: ["DASHBOARD", "LIVE_MONITOR", "SNAPSHOTS", "DISMISSED_SNAPSHOTS"] },
  ]

  function togglePermission(permission: AdminPermission) {
    if (permission === "SYSTEM_SETTINGS" && systemSettingsLocked) return

    const next = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((entry) => entry !== permission)
      : [...selectedPermissions, permission]
    setValue("roles.defaultStaffPermissions", next, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
  }

  function applyPreset(permissions: AdminPermission[]) {
    const next = systemSettingsLocked
      ? permissions.filter((permission) => permission !== "SYSTEM_SETTINGS")
      : permissions
    setValue("roles.defaultStaffPermissions", next, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
  }

  function toggleRequireAdminForSettings(value: boolean) {
    setValue("roles.requireAdminForSettings", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    if (value && selectedPermissions.includes("SYSTEM_SETTINGS")) {
      setValue("roles.defaultStaffPermissions", selectedPermissions.filter((permission) => permission !== "SYSTEM_SETTINGS"), { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    }
  }

  function isPresetActive(permissions: AdminPermission[]) {
    const effective = systemSettingsLocked ? permissions.filter((permission) => permission !== "SYSTEM_SETTINGS") : permissions
    return effective.length === selectedPermissions.length && effective.every((permission) => selectedPermissions.includes(permission))
  }

  function requestSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (hasNoPermissions) return
    setConfirmSaveOpen(true)
  }

  function confirmSave() {
    setConfirmSaveOpen(false)
    void onSubmit()
  }

  function requestApplyToExistingStaff() {
    if (hasNoPermissions) return
    setConfirmApplyOpen(true)
  }

  function confirmApplyToExistingStaff() {
    setConfirmApplyOpen(false)
    void onApplyToExistingStaff()
  }

  return (
    <form onSubmit={requestSave} className="p-6 space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg border border-brand/15 bg-brand/10 p-2 text-brand">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Default staff template</p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Save changes for future staff, or explicitly push this template to every current staff account.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SummaryMetric label="Selected" value={selectedPermissions.length.toString()} />
            <SummaryMetric label="Critical" value={selectedCriticalCount.toString()} tone={selectedCriticalCount > 0 ? "critical" : "neutral"} />
            <SummaryMetric label="Admin Lock" value={requireAdminForSettings ? "On" : "Off"} tone={requireAdminForSettings ? "safe" : "critical"} />
            <SummaryMetric label="Landing" value={selectedPermissions.includes("DASHBOARD") ? "Ready" : "Custom"} tone={selectedPermissions.includes("DASHBOARD") ? "safe" : "neutral"} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Presets</p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.permissions)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition hover:border-brand/30 hover:bg-brand/5",
                  isPresetActive(preset.permissions) ? "border-brand/30 bg-brand/5" : "border-slate-200 bg-slate-50"
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-slate-900">{preset.label}</span>
                  {isPresetActive(preset.permissions) ? (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">Applied</span>
                  ) : (
                    <RotateCcw className="h-4 w-4 text-slate-400" />
                  )}
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasNoPermissions && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Select at least one permission before saving the default staff template.
        </div>
      )}

      {staffDefaultsAppliedCount !== null && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Applied the saved staff template to {staffDefaultsAppliedCount} existing staff account{staffDefaultsAppliedCount === 1 ? "" : "s"}.
        </div>
      )}

      <div className="space-y-5">
        {["Operations", "Automated Capture", "Records & Accountability", "System Administration"].map((section) => {
          const items = adminNavItems.filter((item) => item.section === section)
          const selectedInSection = items.filter((item) => selectedPermissions.includes(item.permission)).length

          return (
            <section key={section} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">{section}</h4>
                  <p className="text-xs font-semibold text-slate-400">{selectedInSection} of {items.length} enabled</p>
                </div>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {items.map((item) => {
                  const Icon = item.icon
                  const checked = selectedPermissions.includes(item.permission)
                  const disabled = item.permission === "SYSTEM_SETTINGS" && systemSettingsLocked

                  return (
                    <button
                      key={item.permission}
                      type="button"
                      onClick={() => togglePermission(item.permission)}
                      disabled={disabled}
                      className={cn(
                        "group rounded-xl border p-4 text-left transition-all",
                        checked ? "border-brand/30 bg-brand/5 shadow-sm" : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white",
                        disabled && "cursor-not-allowed border-slate-200 bg-slate-100/80 opacity-75"
                      )}
                    >
                      <span className="flex items-start gap-3">
                        <span className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                          checked ? "border-brand/20 bg-brand text-white" : "border-slate-200 bg-white text-slate-500",
                          disabled && "bg-slate-200 text-slate-400"
                        )}>
                          {disabled ? <LockKeyhole className="h-4 w-4" /> : checked ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900">{item.label}</span>
                            <RiskBadge risk={item.risk} />
                          </span>
                          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{disabled ? "Locked by the admin-only settings policy." : item.description}</span>
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
        <span className="flex items-start gap-3">
          <span className={cn("mt-0.5 rounded-lg border p-2", requireAdminForSettings ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
            <LockKeyhole className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900">Only admins can edit settings</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">
              Keeps System Settings out of staff defaults and reserves RBAC, retention, and alert templates for administrator accounts.
            </span>
          </span>
        </span>
        <input
          type="checkbox"
          checked={requireAdminForSettings}
          onChange={(event) => toggleRequireAdminForSettings(event.target.checked)}
          className="mt-1 h-5 w-5 accent-brand"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={requestApplyToExistingStaff}
          disabled={hasNoPermissions || isSubmitting || isApplyingStaffDefaults}
          className="h-11 border-amber-200 bg-amber-50 px-5 font-bold text-amber-700 hover:bg-amber-100"
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          {isApplyingStaffDefaults ? "Applying..." : "Save & Apply to Existing Staff"}
        </Button>
        <SettingsSaveButton isSubmitting={isSubmitting} disabled={hasNoPermissions || isApplyingStaffDefaults} label="Save as Default" />
      </div>

      <ConfirmModal
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSave}
        title="Save Staff Default"
        message={`This saves the selected ${selectedPermissions.length} permission${selectedPermissions.length === 1 ? "" : "s"} as the default template for new staff accounts and users promoted to staff later. Existing staff accounts keep their current permissions and sidebars until you use Save & Apply to Existing Staff.`}
        confirmText="Save as Default"
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={confirmApplyOpen}
        onClose={() => setConfirmApplyOpen(false)}
        onConfirm={confirmApplyToExistingStaff}
        title="Apply to Staff"
        message={`This will save this template, then replace permissions for every existing staff account with these ${selectedPermissions.length} permission${selectedPermissions.length === 1 ? "" : "s"}. Staff sidebars will update on refresh, focus, or within about 10 seconds.`}
        confirmText="Apply to Staff"
        isDestructive={selectedCriticalCount > 0}
        isLoading={isSubmitting || isApplyingStaffDefaults}
      />
    </form>
  )
}

function SummaryMetric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "safe" | "critical" }) {
  return (
    <div className={cn(
      "rounded-xl border px-3 py-2",
      tone === "safe" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
        tone === "critical" ? "border-amber-200 bg-amber-50 text-amber-700" :
          "border-slate-200 bg-white text-slate-700"
    )}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  )
}

function RiskBadge({ risk }: { risk: "standard" | "elevated" | "critical" }) {
  const label = risk === "standard" ? "Standard" : risk === "elevated" ? "Elevated" : "Critical"
  return (
    <span className={cn(
      "rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
      risk === "standard" ? "border-slate-200 bg-white text-slate-500" :
        risk === "elevated" ? "border-amber-200 bg-amber-50 text-amber-700" :
          "border-rose-200 bg-rose-50 text-rose-700"
    )}>
      {label}
    </span>
  )
}

type ZonesSettingsPanelProps = SettingsPanelProps & {
  campusZones: string[]
  zoneDraft: string
  onZoneDraftChange: (value: string) => void
  onAddZone: () => void
  onRemoveZone: (zone: string) => void
}

export function ZonesSettingsPanel({
  form,
  onSubmit,
  campusZones,
  zoneDraft,
  onZoneDraftChange,
  onAddZone,
  onRemoveZone,
}: ZonesSettingsPanelProps) {
  const { formState: { isSubmitting } } = form

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={zoneDraft}
          onChange={(event) => onZoneDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onAddZone()
            }
          }}
          placeholder="Add campus zone"
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <Button type="button" onClick={onAddZone} className="h-11 bg-brand hover:bg-brand-active text-white font-bold rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {campusZones.map((zone) => (
          <div key={zone} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm font-bold text-slate-800">{zone}</span>
            <button type="button" onClick={() => onRemoveZone(zone)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <SettingsSaveButton isSubmitting={isSubmitting} />
    </form>
  )
}

export function AlertSettingsPanel({ form, onSubmit }: SettingsPanelProps) {
  const { register, formState: { isSubmitting } } = form

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <SettingsTextarea label="Claim Approved" registration={register("alertTemplates.claimApproved")} />
      <SettingsTextarea label="Claim Denied" registration={register("alertTemplates.claimDenied")} />
      <SettingsTextarea label="Inquiry Required" registration={register("alertTemplates.inquiryRequired")} />
      <SettingsSaveButton isSubmitting={isSubmitting} />
    </form>
  )
}

export function RetentionSettingsPanel({ form, onSubmit }: SettingsPanelProps) {
  const { register, formState: { isSubmitting } } = form

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <SettingsNumberField label="Found Item Retention Days" registration={register("retentionPolicy.foundItemRetentionDays", { valueAsNumber: true })} />
      <SettingsNumberField label="Dismissed Snapshot Retention Days" registration={register("retentionPolicy.dismissedSnapshotRetentionDays", { valueAsNumber: true })} />
      <SettingsNumberField label="Audit Log Retention Days" registration={register("retentionPolicy.auditLogRetentionDays", { valueAsNumber: true })} />
      <SettingsSaveButton isSubmitting={isSubmitting} />
    </form>
  )
}
