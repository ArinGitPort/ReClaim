import { Mail, Users, MoreVertical, Filter } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"

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
    <div className="space-y-8">
      <AdminListHeader
        title="User Directory"
        description="Centralized student database and claim history tracking."
        actions={(
          <>
            <Button
              className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none"
            >
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <Button variant="outline" className="h-10 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </>
        )}
      />

      <AdminListFilters>
        <AdminSearchInput
          placeholder="Search by name, email, or ID..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </AdminListFilters>

      <AdminTableContainer>
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
              <tr>
                <th className="px-8 py-5 text-slate-700">User</th>
                <th className="px-8 py-5 text-slate-700">Role</th>
                <th className="px-8 py-5 text-slate-700">Details</th>
                <th className="px-8 py-5 text-slate-700">Claim History</th>
                <th className="px-8 py-5 text-right text-slate-700">Actions</th>
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
                <tr key={u.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                  <td className="px-8 py-5">
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
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      u.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      u.role === 'STAFF' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {u.studentId ? (
                      <div className="text-sm font-semibold text-slate-700">ID: {u.studentId}</div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">No Student ID</div>
                    )}
                  </td>
                  <td className="px-8 py-5">
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
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </AdminTableContainer>
    </div>
  )
}
