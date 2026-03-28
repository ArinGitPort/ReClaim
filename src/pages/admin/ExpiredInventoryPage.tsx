import { useState, useEffect } from "react"
import { Trash2, Heart, AlertTriangle, Calendar, MapPin } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { api } from "@/lib/api"

interface ExpiredItem {
  id: string
  code: string
  title: string
  category: string
  storage: string
  foundAtUtc: string
  daysExpired: number
  disposalEligibility: "DONATION" | "DISPOSAL" | "AUCTION"
}

export function ExpiredInventoryPage() {
  const [items, setItems] = useState<ExpiredItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchExpired = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<{ items: ExpiredItem[] }>("/inventory/expired")
        setItems(response.data.items)
      } finally {
        setIsLoading(false)
      }
    }
    fetchExpired()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <AdminPageHeader 
        title="Disposal & Donation Queue" 
        subtitle="Manage items that have exceeded the 90-day institutional holding period." 
      />

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: "Eligible for Donation", count: items.length, color: '#059669', icon: Heart },
          { label: "Scheduled for Disposal", count: 0, color: '#DC2626', icon: Trash2 },
          { label: "Pending Processing", count: items.length, color: '#D97706', icon: AlertTriangle }
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, minWidth: '200px', backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon style={{ width: '1.5rem', height: '1.5rem', color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>{stat.count}</div>
            </div>
          </div>
        ))}
      </div>

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
                <th style={{ padding: '1.25rem 2rem' }}>Expired Asset</th>
                <th style={{ padding: '1.25rem 2rem' }}>Retention Status</th>
                <th style={{ padding: '1.25rem 2rem' }}>Storage Metadata</th>
                <th style={{ padding: '1.25rem 2rem' }}>Eligibility</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E2F85', fontFamily: 'monospace' }}>REF: {item.code}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontSize: '12px', fontWeight: 700 }}>
                        <AlertTriangle style={{ width: '0.875rem', height: '0.875rem' }} />
                        {item.daysExpired} Days Past Limit
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '11px', fontWeight: 500 }}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                        Found: {new Date(item.foundAtUtc).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', backgroundColor: '#F8FAFC', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #E2E8F0', width: 'fit-content' }}>
                      <MapPin style={{ width: '0.75rem', height: '0.75rem', color: '#94A3B8' }} />
                      {item.storage}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      padding: '0.125rem 0.625rem', 
                      backgroundColor: '#EFF6FF', 
                      color: '#2563EB', 
                      borderRadius: '9999px', 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      border: '1px solid #DBEAFE'
                    }}>
                      {item.disposalEligibility}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button style={{ height: '2.25rem', width: '2.25rem', padding: 0, backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #DCFCE7', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Mark for Donation">
                        <Heart style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button style={{ height: '2.25rem', width: '2.25rem', padding: 0, backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Schedule Disposal">
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button style={{ height: '2.25rem', padding: '0 0.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '0.5rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                        Release Audit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>Loading disposal queue...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
