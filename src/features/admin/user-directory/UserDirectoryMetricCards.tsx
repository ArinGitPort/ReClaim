import { AlertCircle, History, PackageSearch } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { ActiveModalState, UserDirUser } from "@/features/admin/types"
import { formatShortDate } from "@/lib/formatters"

type UserDirectoryMetricCardsProps = {
  user: UserDirUser
  onOpenModal: (modal: ActiveModalState) => void
}

export function UserDirectoryMetricCards({ user, onOpenModal }: UserDirectoryMetricCardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Directory Status</p>
          <div className="mt-2">
            <StatusBadge status={user.status} />
          </div>
          {user.disabledReason && <p className="mt-3 text-xs font-semibold text-slate-500">{user.disabledReason}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Sign In</p>
          <p className="mt-2 text-sm font-bold text-slate-800">{formatShortDate(user.lastLoginAt)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Tracked on successful login.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password State</p>
          <div className="mt-2">
            <StatusBadge status={user.passwordResetRequired ? "PASSWORD_RESET_REQUIRED" : "ACTIVE"} />
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {user.passwordResetRequired ? "Temporary credentials are currently assigned." : "No admin reset is pending."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onOpenModal("pending")}
          className="text-left bg-amber-50 hover:bg-amber-100/50 transition-colors cursor-pointer border border-amber-200 rounded-xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group"
        >
          <AlertCircle className="absolute -right-2 -bottom-2 w-20 h-20 text-amber-500 opacity-10 group-hover:scale-110 transition-transform" />
          <span className="text-amber-800 font-bold text-sm tracking-tight mb-1">Pending Verifications</span>
          <div className="text-3xl font-black text-amber-600">{user.metrics?.pendingClaims ?? 0}</div>
          <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-widest mt-3 flex items-center">
            Review Queue {"\u2192"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal("missing")}
          className="text-left bg-emerald-50 hover:bg-emerald-100/50 transition-colors cursor-pointer border border-emerald-200 rounded-xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group"
        >
          <PackageSearch className="absolute -right-2 -bottom-2 w-20 h-20 text-emerald-500 opacity-10 group-hover:scale-110 transition-transform" />
          <span className="text-emerald-800 font-bold text-sm tracking-tight mb-1">Missing Items Reported</span>
          <div className="text-3xl font-black text-emerald-600">{user.metrics?.activeReports ?? 0}</div>
          <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest mt-3 flex items-center">
            View Reports {"\u2192"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal("history")}
          className="text-left bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer border border-slate-200 rounded-xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group"
        >
          <History className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-500 opacity-10 group-hover:scale-110 transition-transform" />
          <span className="text-slate-800 font-bold text-sm tracking-tight mb-1">Total Lifetime Claims</span>
          <div className="text-3xl font-black text-slate-600">{user._count.claims}</div>
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-3 flex items-center">
            View History {"\u2192"}
          </span>
        </button>
      </div>
    </>
  )
}
