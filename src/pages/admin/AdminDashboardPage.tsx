import { 
  TrendingUp, 
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  Package,
  Users
} from "lucide-react"

const metrics = [
  { 
    icon: <Package style={{ width: '1.25rem', height: '1.25rem', color: '#1E2F85' }} />, 
    label: "Total Inventory", 
    value: "1,284", 
    trend: "+12 this week", 
    color: "brand" 
  },
  { 
    icon: <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />, 
    label: "Items Returned", 
    value: "842", 
    trend: "65% Success Rate", 
    color: "emerald" 
  },
  { 
    icon: <Users style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6' }} />, 
    label: "Active Users", 
    value: "4,102", 
    trend: "+156 new signups", 
    color: "blue" 
  },
  { 
    icon: <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B' }} />, 
    label: "Pending Claims", 
    value: "28", 
    trend: "Needs Review", 
    color: "amber",
    alert: true
  }
]

const recentMatches = [
  { id: 1, item: "MacBook Air M2", owner: "Sarah Jenkins", match: "98%", time: "2h ago" },
  { id: 2, item: "Blue Hydroflask", owner: "Mike Peterson", match: "85%", time: "5h ago" },
  { id: 3, item: "Sony Headphones", owner: "David Lee", match: "92%", time: "1d ago" },
]

export function AdminDashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Consistent Header Pattern */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Executive Overview</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Real-time system performance and audit tracking.</p>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            color={metric.color}
            alert={metric.alert}
          />
        ))}
      </div>

      {/* Bottom Insights Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem' }}>
        <div style={{ gridColumn: 'span 2', backgroundColor: '#FFFFFF', borderRadius: '1rem', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
             <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <TrendingUp style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
              High-Confidence Match Alerts
            </h3>
            <button style={{ fontSize: '10px', fontWeight: 700, color: '#1E2F85', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
              View All <ArrowUpRight style={{ width: '0.75rem', height: '0.75rem' }} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentMatches.map(match => (
              <div key={match.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: 'rgba(30, 47, 133, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E2F85', fontWeight: 700, fontSize: '0.75rem' }}>
                    {match.match}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{match.item}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, margin: 0 }}>Claimant: {match.owner}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{match.time}</span>
                  <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button style={{ fontSize: '10px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>Verify</button>
                    <button style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Section */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Platform Integrity</h3>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <HealthItem label="Database Latency" value="24ms" status="OPTIMAL" />
            <HealthItem label="Image Storage" value="1.2 TB / 5 TB" status="STABLE" />
            <HealthItem label="API Response" value="112ms" status="HEALTHY" />
            <HealthItem label="Real-time Socket" value="CONNECTED" status="ACTIVE" />
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', margin: 0 }}>Last Maintenance</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', margin: 0 }}>March 20, 2026 - All systems operational.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthItem({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{value}</p>
      </div>
      <span style={{ padding: '0.125rem 0.5rem', backgroundColor: '#F0FDF4', color: '#059669', fontSize: '10px', fontWeight: 700, borderRadius: '0.375rem', border: '1px solid #DCFCE7' }}>
        {status}
      </span>
    </div>
  )
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  trend, 
  color, 
  alert = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string;
  color: string;
  alert?: boolean;
}) {
  const iconBg = color === 'brand' ? 'rgba(30, 47, 133, 0.05)' :
                color === 'amber' ? '#FFFBEB' :
                color === 'emerald' ? '#F0FDF4' :
                '#EFF6FF'
  
  const iconBorder = color === 'brand' ? 'rgba(30, 47, 133, 0.1)' :
                    color === 'amber' ? '#FEF3C7' :
                    color === 'emerald' ? '#DCFCE7' :
                    '#DBEAFE'

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg, border: `1px solid ${iconBorder}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          {icon}
        </div>
        {alert && <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#F59E0B', boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.1)' }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1, margin: 0 }}>{label}</p>
        <h4 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>{value}</h4>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.025em', color: alert ? '#D97706' : '#94A3B8', margin: 0 }}>{trend}</p>
      </div>
    </div>
  )
}
