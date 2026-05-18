import { Building, Mail, Phone, Plus, Trash2 } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  SettingsField,
  SettingsNumberField,
  SettingsSaveButton,
  SettingsTextarea,
  SettingsToggle,
  settingsInputClassName,
} from "./SettingsFormPrimitives"
import type { SystemSettings } from "./types"

type SettingsPanelProps = {
  form: UseFormReturn<SystemSettings>
  onSubmit: () => void
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

export function RolesSettingsPanel({ form, onSubmit }: SettingsPanelProps) {
  const { register, formState: { isSubmitting } } = form

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <SettingsToggle label="Staff can manage inventory" description="Staff may create, edit, archive, and restore found item records." registration={register("roles.allowStaffManageInventory")} />
      <SettingsToggle label="Staff can review claims" description="Staff may approve, deny, or request more information for item claims." registration={register("roles.allowStaffManageClaims")} />
      <SettingsToggle label="Staff can view reports" description="Staff may access missing-item reports and claim history." registration={register("roles.allowStaffViewReports")} />
      <SettingsToggle label="Only admins can edit settings" description="System settings remain restricted to administrator accounts." registration={register("roles.requireAdminForSettings")} />
      <SettingsSaveButton isSubmitting={isSubmitting} />
    </form>
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
