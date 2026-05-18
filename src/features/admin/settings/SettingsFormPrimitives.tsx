import type { ReactNode } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Loader2, Save } from "lucide-react"

export const settingsInputClassName =
  "w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm font-semibold text-slate-900"

export function SettingsField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
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

export function SettingsToggle({
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

export function SettingsTextarea({ label, registration }: { label: string; registration: UseFormRegisterReturn }) {
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

export function SettingsNumberField({ label, registration }: { label: string; registration: UseFormRegisterReturn }) {
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

export function SettingsSaveButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="pt-2 flex justify-end">
      <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 h-11 px-8 rounded-xl bg-brand text-white text-sm font-bold shadow-sm hover:bg-brand-active transition-colors disabled:opacity-70">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}
