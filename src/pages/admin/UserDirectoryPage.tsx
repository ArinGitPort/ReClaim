import { useState, useEffect } from "react"
import { Search, UserCircle, Mail, ExternalLink, ShieldCheck, Clock } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { AdminSearchFilterBar } from "@/components/admin/AdminSearchFilterBar"
import { Input } from "@/components/ui/Input"
import { api } from "@/lib/api"

interface UserEntry {
  id: string
  name: string
  studentId?: string | null
  email: string
  role: "STUDENT" | "STAFF" | "ADMIN"
  avatar?: string
  stats: {
    totalClaims: number
    totalReports: number
    verificationStatus: "VERIFIED" | "PENDING"
  }
}

export function UserDirectoryPage() {
  const [users, setUsers] = useState<UserEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<{ users: UserEntry[] }>("/admin/users", {
          params: { search: search.trim() || undefined }
        })
        setUsers(response.data.users)
      } finally {
        setIsLoading(false)
      }
    }
    
    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <AdminPageHeader 
        title="Institutional User Directory" 
        subtitle="Manage and audit system access for all registered university accounts." 
      />

      <AdminSearchFilterBar>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
          <Input 
            placeholder="Search by name, student ID, or institutional email..." 
            style={{ 
              paddingLeft: '3rem', 
              height: '3rem', 
              width: '100%', 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E2E8F0', 
              borderRadius: '0.75rem', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
              boxSizing: 'border-box' 
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </AdminSearchFilterBar>

      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: '0.75rem', 
        border: '1px solid #E2E8F0', 
        overflow: 'hidden', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#F8FAFC', 
                borderBottom: '1px solid #F1F5F9', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                fontWeight: 700, 
                fontSize: '10px', 
                color: '#334155' 
              }}>
                <th style={{ padding: '1.25rem 2rem' }}>User / Identity</th>
                <th style={{ padding: '1.25rem 2rem' }}>Institutional Role</th>
                <th style={{ padding: '1.25rem 2rem' }}>Activity History</th>
                <th style={{ padding: '1.25rem 2rem' }}>Account Status</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '2.5rem', 
                        height: '2.5rem', 
                        backgroundColor: '#F1F5F9', 
                        borderRadius: '9999px', 
                        overflow: 'hidden', 
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <UserCircle style={{ width: '1.5rem', height: '1.5rem', color: '#CBD5E1' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>{user.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748B', fontSize: '11px', fontWeight: 500 }}>
                          <Mail style={{ width: '0.75rem', height: '0.75rem' }} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '0.125rem 0.5rem', 
                        backgroundColor: user.role === 'STAFF' ? '#F0FDF4' : '#F8FAFC', 
                        color: user.role === 'STAFF' ? '#166534' : '#64748B', 
                        borderRadius: '0.375rem', 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        letterSpacing: '0.05em',
                        border: `1px solid ${user.role === 'STAFF' ? '#DCFCE7' : '#E2E8F0'}`,
                        width: 'fit-content'
                      }}>
                        {user.role}
                      </span>
                      {user.studentId && (
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E2F85', fontFamily: 'monospace' }}>ID: {user.studentId}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Claims</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{user.stats.totalClaims}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reports</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{user.stats.totalReports}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {user.stats.verificationStatus === 'VERIFIED' ? (
                        <>
                          <ShieldCheck style={{ width: '1rem', height: '1rem', color: '#059669' }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>Verified Identity</span>
                        </>
                      ) : (
                        <>
                          <Clock style={{ width: '1rem', height: '1rem', color: '#D97706' }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706' }}>Pending Review</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                    <button 
                      style={{ 
                        height: '2.25rem', 
                        padding: '0 0.75rem', 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #E2E8F0', 
                        color: '#475569', 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em', 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.375rem' 
                      }}
                    >
                      <ExternalLink style={{ width: '0.875rem', height: '0.875rem' }} /> Full Profile
                    </button>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>Syncing user database...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
