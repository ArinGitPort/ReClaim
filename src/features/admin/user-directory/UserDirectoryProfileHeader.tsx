import { FileBadge, Mail, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { UserDirUser } from "@/features/admin/types"
import { formatShortDate } from "@/lib/formatters"

type UserDirectoryProfileHeaderProps = {
  user: UserDirUser
  onManageProfile: () => void
}

export function UserDirectoryProfileHeader({ user, onManageProfile }: UserDirectoryProfileHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 p-8 relative overflow-hidden flex-shrink-0">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <ShieldAlert className="w-48 h-48 text-brand" />
      </div>

      <div className="flex items-start justify-between relative z-10 w-full flex-col md:flex-row gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-3xl font-extrabold uppercase shadow-sm text-slate-400">
            {user.name.substring(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-slate-500 font-medium text-[13px]">
              <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5 text-slate-400" /> {user.email}</span>
              <span className="text-slate-300">{"\u2022"}</span>
              <span className="flex items-center"><FileBadge className="w-4 h-4 mr-1.5 text-slate-400" /> ID: {user.studentId || "UNVERIFIED"}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded border ${
                user.role === "ADMIN" ? "bg-amber-50 border-amber-200 text-amber-700" :
                  user.role === "STUDENT" ? "bg-brand/10 border-brand/20 text-brand" :
                    "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
              >
                {user.role} Account
              </span>
              <StatusBadge status={user.status} className="px-2.5 py-1 text-[10px] rounded" />
              {user.passwordResetRequired && (
                <StatusBadge status="PASSWORD_RESET_REQUIRED" className="px-2.5 py-1 text-[10px] rounded" />
              )}
              <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-slate-50 border border-slate-200 text-slate-500">
                Joined {formatShortDate(user.createdAt)}
              </span>
              <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-slate-50 border border-slate-200 text-slate-500">
                Last Login {formatShortDate(user.lastLoginAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[140px]">
          <Button
            onClick={onManageProfile}
            variant="outline"
            className="bg-brand hover:bg-brand-active border-none text-white font-bold shadow-sm h-10 w-full uppercase tracking-widest text-[11px]"
          >
            Manage Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
