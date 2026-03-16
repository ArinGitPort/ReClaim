import { Users } from "lucide-react"

export function AdminUserDirectoryPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Directory</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Centralized student database and claim history tracking.</p>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Users className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Directory Module Initializing</h3>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Student profiles and activity logs are being synced.</p>
      </div>
    </div>
  )
}
