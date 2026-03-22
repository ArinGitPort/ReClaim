import { useAuth } from "@/contexts/AuthContext"
import { TopNavBar } from "@/layouts/TopNavBar"
import { User, Calendar, Camera, Key, Fingerprint, History, HelpCircle, MapPin } from "lucide-react"

export function UserProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-24">
      <TopNavBar title="My Profile" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
              <div className="flex flex-col items-center space-y-4 p-6 text-center">
                <div className="relative group">
                  <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-100/50 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-slate-300" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg tracking-tight">{user.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{user.role}</p>
                </div>
                <div className="w-full pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">12</div>
                    <div className="text-xs text-slate-500 font-medium">Reports</div>
                  </div>
                  <div className="text-center border-l border-slate-100">
                    <div className="text-lg font-bold text-slate-900">4</div>
                    <div className="text-xs text-slate-500 font-medium">Claims</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <h3 className="font-semibold leading-none tracking-tight">Security & Access</h3>
              </div>
              <div className="p-6 pt-0 space-y-2">
                <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 transition-colors text-slate-700">
                  <span className="flex items-center gap-2"><Key className="h-4 w-4 text-slate-500" /> Password</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 transition-colors text-slate-700">
                  <span className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-slate-500" /> Two-Factor Auth</span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Disabled</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 transition-colors text-slate-700">
                  <span className="flex items-center gap-2"><History className="h-4 w-4 text-slate-500" /> Sessions</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">Personal Information</h3>
                <p className="text-sm text-slate-500">Review your authenticated identity data bound to your account.</p>
              </div>
              <div className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold leading-none text-slate-900">Full Name</label>
                  <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 pointer-events-none">
                    {user.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold leading-none text-slate-900">Email Address</label>
                  <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 pointer-events-none">
                    {user.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold leading-none text-slate-900">Primary Identifier</label>
                  <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 pointer-events-none">
                    {user.studentId || "System Authorization"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold leading-none text-slate-900">Date Joined</label>
                  <div className="flex items-center gap-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 pointer-events-none">
                    <Calendar className="h-4 w-4" /> March 2024
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">Campus Affiliation</h3>
                <p className="text-sm text-slate-500">Your registered physical campus logic details.</p>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white border border-slate-200 shadow-sm rounded-md">
                      <MapPin className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-900">National University - Main</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Manila, Philippines</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    Primary
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#1E2F85] text-white shadow-sm overflow-hidden relative">
              <div className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="max-w-sm">
                    <h3 className="font-semibold tracking-tight text-lg mb-2">Need assistance?</h3>
                    <p className="text-sm text-white/80 leading-relaxed mb-6">
                      Contact our campus admin office for assistance with claimed items or verification processes.
                    </p>
                    <button className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-[#1E2F85] shadow transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <HelpCircle className="mr-2 h-4 w-4" /> Support Center
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
