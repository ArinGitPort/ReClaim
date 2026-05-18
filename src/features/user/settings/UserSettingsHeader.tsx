import { User } from "lucide-react"
import type { UserSettingsTab } from "./types"

type UserSettingsHeaderProps = {
  user: {
    name?: string | null
    email?: string | null
    passwordResetRequired?: boolean | null
  } | null
  onEditProfile: (tab: UserSettingsTab) => void
}

export function UserSettingsHeader({ user, onEditProfile }: UserSettingsHeaderProps) {
  return (
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
          onClick={() => onEditProfile("account")}
          className="hidden sm:inline-flex h-10 px-5 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}
