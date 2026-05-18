import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"

export const userSettingsInputClassName =
  "w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-semibold text-slate-900"

export function UserSettingsField({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold tracking-wide uppercase text-slate-500 mb-2">{label}</span>
      <span className="relative block">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        {children}
      </span>
    </label>
  )
}

export function ReadOnlyUserField({ label, icon, value }: { label: string; icon: ReactNode; value: string }) {
  return (
    <UserSettingsField label={label} icon={icon}>
      <input readOnly value={value} className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none text-sm font-semibold" />
    </UserSettingsField>
  )
}

export function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 cursor-pointer">
      <span>
        <span className="block text-sm font-bold text-slate-900">{label}</span>
        <span className="block text-xs font-medium text-slate-500 mt-1">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-brand" />
    </label>
  )
}

export function UserSettingsSaveButton({
  isSubmitting,
  label = "Save Changes",
  onClick,
}: {
  isSubmitting: boolean
  label?: string
  onClick?: () => void
}) {
  return (
    <div className="pt-2 flex justify-end">
      <button type={onClick ? "button" : "submit"} onClick={onClick} disabled={isSubmitting} className="flex items-center gap-2 h-11 px-8 rounded-xl bg-brand text-white text-sm font-bold shadow-sm hover:bg-brand-active transition-colors disabled:opacity-70">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isSubmitting ? "Saving..." : label}
      </button>
    </div>
  )
}
