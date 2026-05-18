import { type FormEvent, useEffect, useState } from "react"
import { AxiosError } from "axios"
import { User, Bell, Palette, Shield, Mail, Phone, MapPin, BadgeCheck, Loader2, CheckCircle2, KeyRound } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { ThemeToggle } from "@/layouts/ThemeToggle"
import { cn } from "@/lib/utils"

type SettingsTab = "account" | "notifications" | "appearance" | "security"

type NotificationPreferences = {
  claimUpdates: boolean
  reportUpdates: boolean
  pickupReminders: boolean
}

const defaultPreferences: NotificationPreferences = {
  claimUpdates: true,
  reportUpdates: true,
  pickupReminders: true,
}

export function SettingsPage() {
  const { user, setCurrentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>("account")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [department, setDepartment] = useState("")
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setName(user.name ?? "")
    setPhone(user.phone ?? "")
    setDepartment(user.department ?? "")
    setPreferences({ ...defaultPreferences, ...(user.notificationPreferences ?? {}) })
  }, [user])

  async function saveProfile(event?: FormEvent) {
    event?.preventDefault()
    setIsSavingProfile(true)
    setError(null)

    try {
      const response = await api.patch("/auth/me", {
        name: name.trim(),
        phone: phone.trim() || null,
        department: department.trim() || null,
        notificationPreferences: preferences,
      })
      setCurrentUser(response.data.user)
      flashSaved("Profile saved")
    } catch (err) {
      setError(readError(err, "Unable to save profile settings."))
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.")
      return
    }

    setIsSavingPassword(true)
    try {
      const response = await api.patch("/auth/password", {
        currentPassword,
        newPassword,
      })
      setCurrentUser(response.data.user)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      flashSaved("Password updated")
    } catch (err) {
      setError(readError(err, "Unable to update password."))
    } finally {
      setIsSavingPassword(false)
    }
  }

  function flashSaved(message: string) {
    setSavedMessage(message)
    window.setTimeout(() => setSavedMessage(null), 3000)
  }

  return (
    <div className="w-full min-h-full pb-24 bg-slate-50/30">
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account details, preferences, and password.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0 text-brand">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{user?.name || "Student Name"}</h3>
              <p className="text-slate-500 font-medium">{user?.email || "student@university.edu"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold tracking-widest uppercase">
                <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">Student Account</span>
                <span className="bg-brand/10 text-brand px-3 py-1.5 rounded-lg">Verified Member</span>
                {user?.passwordResetRequired && <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg">Password Reset Required</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className="hidden sm:inline-flex h-10 px-5 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          <div className="md:col-span-1 space-y-1">
            <NavButton active={activeTab === "account"} icon={<User className="w-5 h-5" />} label="Account Detail" onClick={() => setActiveTab("account")} />
            <NavButton active={activeTab === "notifications"} icon={<Bell className="w-5 h-5" />} label="Notifications" onClick={() => setActiveTab("notifications")} />
            <NavButton active={activeTab === "appearance"} icon={<Palette className="w-5 h-5" />} label="Appearance" onClick={() => setActiveTab("appearance")} />
            <NavButton active={activeTab === "security"} icon={<Shield className="w-5 h-5" />} label="Security" onClick={() => setActiveTab("security")} />
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{sectionTitle(activeTab)}</h3>
                  <p className="text-sm text-slate-500 mt-1">{sectionDescription(activeTab)}</p>
                </div>
                {savedMessage && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in duration-300">
                    <CheckCircle2 className="w-4 h-4" /> {savedMessage}
                  </div>
                )}
              </div>

              {activeTab === "account" && (
                <form onSubmit={saveProfile} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <input value={name} onChange={(event) => setName(event.target.value)} className={inputClassName} required />
                    </Field>
                    <ReadOnlyField label="Student ID" icon={<BadgeCheck className="w-4 h-4" />} value={user?.studentId || "Not provided"} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ReadOnlyField label="Email Address" icon={<Mail className="w-4 h-4" />} value={user?.email || "student@university.edu"} />
                    <Field label="Phone Number" icon={<Phone className="w-4 h-4" />}>
                      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 (555) 000-0000" className={`${inputClassName} pl-11`} />
                    </Field>
                  </div>
                  <Field label="Department / Major" icon={<MapPin className="w-4 h-4" />}>
                    <input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="e.g. Computer Science" className={`${inputClassName} pl-11`} />
                  </Field>
                  <SaveButton isSubmitting={isSavingProfile} />
                </form>
              )}

              {activeTab === "notifications" && (
                <div className="p-6 space-y-4">
                  <PreferenceToggle label="Claim updates" description="Notify me when my claim changes status or receives a staff message." checked={preferences.claimUpdates} onChange={(value) => setPreferences((current) => ({ ...current, claimUpdates: value }))} />
                  <PreferenceToggle label="Report updates" description="Notify me when my lost report is reviewed, matched, or resolved." checked={preferences.reportUpdates} onChange={(value) => setPreferences((current) => ({ ...current, reportUpdates: value }))} />
                  <PreferenceToggle label="Pickup reminders" description="Notify me when a pickup token is ready or close to expiry." checked={preferences.pickupReminders} onChange={(value) => setPreferences((current) => ({ ...current, pickupReminders: value }))} />
                  <SaveButton isSubmitting={isSavingProfile} onClick={() => void saveProfile()} />
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="p-6">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Theme</h4>
                      <p className="text-xs text-slate-500 mt-1">Switch between light and dark display mode.</p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <form onSubmit={savePassword} className="p-6 space-y-5">
                  <Field label="Current Password" icon={<KeyRound className="w-4 h-4" />}>
                    <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={`${inputClassName} pl-11`} minLength={8} required />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="New Password">
                      <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClassName} minLength={8} required />
                    </Field>
                    <Field label="Confirm New Password">
                      <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClassName} minLength={8} required />
                    </Field>
                  </div>
                  <SaveButton isSubmitting={isSavingPassword} label="Update Password" />
                </form>
              )}

              {error && <div className="mx-6 mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const inputClassName = "w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-semibold text-slate-900"

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition-colors",
        active ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
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

function ReadOnlyField({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  return (
    <Field label={label} icon={icon}>
      <input readOnly value={value} className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none text-sm font-semibold" />
    </Field>
  )
}

function PreferenceToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
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

function SaveButton({ isSubmitting, label = "Save Changes", onClick }: { isSubmitting: boolean; label?: string; onClick?: () => void }) {
  return (
    <div className="pt-2 flex justify-end">
      <button type={onClick ? "button" : "submit"} onClick={onClick} disabled={isSubmitting} className="flex items-center gap-2 h-11 px-8 rounded-xl bg-brand text-white text-sm font-bold shadow-sm hover:bg-brand-active transition-colors disabled:opacity-70">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isSubmitting ? "Saving..." : label}
      </button>
    </div>
  )
}

function sectionTitle(tab: SettingsTab): string {
  if (tab === "notifications") return "Notification Preferences"
  if (tab === "appearance") return "Appearance"
  if (tab === "security") return "Account Security"
  return "Personal Information"
}

function sectionDescription(tab: SettingsTab): string {
  if (tab === "notifications") return "Choose which system events should appear in your notification feed."
  if (tab === "appearance") return "Adjust how ReClaim looks on this device."
  if (tab === "security") return "Change your login password."
  return "Update your contact details so staff can reach you when items are found."
}

function readError(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as { error?: string } | undefined)?.error ?? fallback
  }
  return fallback
}
