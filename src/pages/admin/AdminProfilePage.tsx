import { useAuth } from "@/contexts/AuthContext"
import { TopNavBar } from "@/layouts/TopNavBar"
import { User, Mail, GraduationCap, Shield, MapPin, Calendar, Camera } from "lucide-react"

export function AdminProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="w-full min-h-full pb-24 bg-slate-50/50">
      <TopNavBar title="My Profile" />

      <main className="max-w-4xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Quick Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-300" />
                  )}
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-brand text-white rounded-full shadow-lg hover:bg-brand-active transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{user.role}</p>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-around text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900">12</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">4</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Claims</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Links</h3>
              <nav className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Activity Log</button>
                <button className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Privacy Settings</button>
                <button className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">Request Account Deletion</button>
              </nav>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <InfoItem 
                  icon={<User className="w-4 h-4 text-slate-400" />}
                  label="Full Name"
                  value={user.name}
                />
                <InfoItem 
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                  label="Email Address"
                  value={user.email}
                />
                <InfoItem 
                  icon={<GraduationCap className="w-4 h-4 text-slate-400" />}
                  label="Student ID"
                  value={user.studentId || "N/A"}
                />
                <InfoItem 
                  icon={<Calendar className="w-4 h-4 text-slate-400" />}
                  label="Joined Date"
                  value="March 2024"
                />
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand" />
                  Campus Association
                </h3>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">National University - Main</p>
                    <p className="text-xs text-slate-500 font-medium">Manila, Philippines</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Primary Campus</span>
                </div>
              </div>
            </div>

            <div className="bg-navy rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Need help with an item?</h3>
                <p className="text-white/80 text-sm mb-6 max-w-sm">Contact our campus admin office for assistance with claimed items or verification processes.</p>
                <button className="px-6 py-2.5 bg-white text-navy rounded-xl text-sm font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95">
                  Contact Support Office
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-brand/20 rounded-full blur-2xl -z-0" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-slate-800 font-bold ml-6">{value}</p>
    </div>
  )
}

