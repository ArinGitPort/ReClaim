import type { Dispatch, FormEvent, SetStateAction } from "react"
import { BadgeCheck, CheckCircle2, KeyRound, Mail, MapPin, Phone } from "lucide-react"
import { ThemeToggle } from "@/layouts/ThemeToggle"
import {
  PreferenceToggle,
  ReadOnlyUserField,
  UserSettingsField,
  UserSettingsSaveButton,
  userSettingsInputClassName,
} from "./UserSettingsPrimitives"
import { getUserSettingsDescription, getUserSettingsTitle } from "./userSettingsText"
import type { NotificationPreferences, UserSettingsTab } from "./types"

type UserSettingsPanelProps = {
  activeTab: UserSettingsTab
  state: {
    user: {
      studentId?: string | null
      email?: string | null
    } | null
    name: string
    setName: (value: string) => void
    phone: string
    setPhone: (value: string) => void
    department: string
    setDepartment: (value: string) => void
    preferences: NotificationPreferences
    setPreferences: Dispatch<SetStateAction<NotificationPreferences>>
    currentPassword: string
    setCurrentPassword: (value: string) => void
    newPassword: string
    setNewPassword: (value: string) => void
    confirmPassword: string
    setConfirmPassword: (value: string) => void
    isSavingProfile: boolean
    isSavingPassword: boolean
    savedMessage: string | null
    error: string | null
    saveProfile: (event?: FormEvent) => Promise<void>
    savePassword: (event: FormEvent) => Promise<void>
  }
}

export function UserSettingsPanel({ activeTab, state }: UserSettingsPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{getUserSettingsTitle(activeTab)}</h3>
          <p className="text-sm text-slate-500 mt-1">{getUserSettingsDescription(activeTab)}</p>
        </div>
        {state.savedMessage && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4" /> {state.savedMessage}
          </div>
        )}
      </div>

      {activeTab === "account" && <AccountSettingsPanel state={state} />}
      {activeTab === "notifications" && <NotificationSettingsPanel state={state} />}
      {activeTab === "appearance" && <AppearanceSettingsPanel />}
      {activeTab === "security" && <SecuritySettingsPanel state={state} />}

      {state.error && <div className="mx-6 mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{state.error}</div>}
    </div>
  )
}

function AccountSettingsPanel({ state }: Pick<UserSettingsPanelProps, "state">) {
  return (
    <form onSubmit={state.saveProfile} className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UserSettingsField label="Full Name">
          <input value={state.name} onChange={(event) => state.setName(event.target.value)} className={userSettingsInputClassName} required />
        </UserSettingsField>
        <ReadOnlyUserField label="Student ID" icon={<BadgeCheck className="w-4 h-4" />} value={state.user?.studentId || "Not provided"} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadOnlyUserField label="Email Address" icon={<Mail className="w-4 h-4" />} value={state.user?.email || "student@university.edu"} />
        <UserSettingsField label="Phone Number" icon={<Phone className="w-4 h-4" />}>
          <input value={state.phone} onChange={(event) => state.setPhone(event.target.value)} placeholder="+1 (555) 000-0000" className={`${userSettingsInputClassName} pl-11`} />
        </UserSettingsField>
      </div>
      <UserSettingsField label="Department / Major" icon={<MapPin className="w-4 h-4" />}>
        <input value={state.department} onChange={(event) => state.setDepartment(event.target.value)} placeholder="e.g. Computer Science" className={`${userSettingsInputClassName} pl-11`} />
      </UserSettingsField>
      <UserSettingsSaveButton isSubmitting={state.isSavingProfile} />
    </form>
  )
}

function NotificationSettingsPanel({ state }: Pick<UserSettingsPanelProps, "state">) {
  return (
    <div className="p-6 space-y-4">
      <PreferenceToggle label="Claim updates" description="Notify me when my claim changes status or receives a staff message." checked={state.preferences.claimUpdates} onChange={(value) => state.setPreferences((current) => ({ ...current, claimUpdates: value }))} />
      <PreferenceToggle label="Report updates" description="Notify me when my lost report is reviewed, matched, or resolved." checked={state.preferences.reportUpdates} onChange={(value) => state.setPreferences((current) => ({ ...current, reportUpdates: value }))} />
      <PreferenceToggle label="Pickup reminders" description="Notify me when a pickup token is ready or close to expiry." checked={state.preferences.pickupReminders} onChange={(value) => state.setPreferences((current) => ({ ...current, pickupReminders: value }))} />
      <UserSettingsSaveButton isSubmitting={state.isSavingProfile} onClick={() => void state.saveProfile()} />
    </div>
  )
}

function AppearanceSettingsPanel() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Theme</h4>
          <p className="text-xs text-slate-500 mt-1">Switch between light and dark display mode.</p>
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}

function SecuritySettingsPanel({ state }: Pick<UserSettingsPanelProps, "state">) {
  return (
    <form onSubmit={state.savePassword} className="p-6 space-y-5">
      <UserSettingsField label="Current Password" icon={<KeyRound className="w-4 h-4" />}>
        <input type="password" value={state.currentPassword} onChange={(event) => state.setCurrentPassword(event.target.value)} className={`${userSettingsInputClassName} pl-11`} minLength={8} required />
      </UserSettingsField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UserSettingsField label="New Password">
          <input type="password" value={state.newPassword} onChange={(event) => state.setNewPassword(event.target.value)} className={userSettingsInputClassName} minLength={8} required />
        </UserSettingsField>
        <UserSettingsField label="Confirm New Password">
          <input type="password" value={state.confirmPassword} onChange={(event) => state.setConfirmPassword(event.target.value)} className={userSettingsInputClassName} minLength={8} required />
        </UserSettingsField>
      </div>
      <UserSettingsSaveButton isSubmitting={state.isSavingPassword} label="Update Password" />
    </form>
  )
}
