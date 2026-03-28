import { Mail, Search, Users, MoreVertical, Filter } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

type UserDirUser = {
  id: string
  name: string
  email: string
  studentId: string | null
  role: string
  _count: { claims: number }
}

export function UserDirectoryPage() {
  const [users, setUsers] = useState<UserDirUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/user', { params: { search: searchQuery || undefined } })
      setUsers(res.data.users || [])
    } catch (err) {
      console.error("Failed to load users", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Centralized student database and claim history tracking.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm">
             <Filter className="w-4 h-4" /> Filters
           </button>
           <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-active transition-colors font-semibold text-sm shadow-sm">
             <Users className="w-4 h-4" /> Add User
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Claim History</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">No users found.</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm uppercase">
                          {u.name.substring(0,2)}
                        </div>
                        <div>
                           <div className="font-bold text-slate-900">{u.name}</div>
                           <div className="text-xs text-slate-500 flex items-center gap-1">
                             <Mail className="w-3 h-3" /> {u.email}
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      u.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      u.role === 'STAFF' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.studentId ? (
                      <div className="text-sm font-semibold text-slate-700">ID: {u.studentId}</div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">No Student ID</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      {u._count.claims > 0 ? (
                        <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 font-semibold text-xs">
                          {u._count.claims} Past {u._count.claims === 1 ? 'Claim' : 'Claims'}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-sm">No reports</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
