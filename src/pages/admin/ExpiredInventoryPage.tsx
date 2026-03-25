import { Archive } from "lucide-react"

export function ExpiredInventoryPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Expired Inventory</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>Management of items past the institutional holding period.</p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', padding: '3rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
        <div style={{ width: '4rem', height: '4rem', backgroundColor: '#F8FAFC', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem', border: '1px solid #F1F5F9' }}>
          <Archive style={{ width: '2rem', height: '2rem', color: '#CBD5E1' }} />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>Disposal Queue Ready</h3>
        <p style={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>All items eligible for donation/disposal will be listed here.</p>
      </div>
    </div>
  )
}
