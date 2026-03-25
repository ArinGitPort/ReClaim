import { X, ExternalLink, ShieldCheck, Mail, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface InventoryItemDetailsModalProps {
  item: any
  onClose: () => void
}

export function InventoryItemDetailsModal({ item, onClose }: InventoryItemDetailsModalProps) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '95vh' }}>
      <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
             {item.photoUrl ? (
               <img src={item.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             ) : (
               <ShieldCheck style={{ width: '1.75rem', height: '1.75rem', color: '#1E2F85' }} />
             )}
           </div>
           <div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: '1.25', margin: 0 }}>{item.title}</h2>
             <p style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'monospace', marginTop: '0.125rem', margin: 0 }}>{item.code}</p>
           </div>
        </div>
        <button onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid transparent', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X style={{ width: '1.5rem', height: '1.5rem', color: '#94A3B8' }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '3rem' }}>
          {/* Left Column: Core Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
             <DetailSection title="Record Metadata">
                <DetailItem icon={<Calendar style={{ width: '1rem', height: '1rem' }} />} label="Date Registered" value={item.date} />
                <DetailItem icon={<ShieldCheck style={{ width: '1rem', height: '1rem' }} />} label="Current Status" value={item.status} active />
                <DetailItem icon={<Mail style={{ width: '1rem', height: '1rem' }} />} label="Storage Location" value={item.storage} />
             </DetailSection>

             <DetailSection title="Detection Details">
                <DetailItem icon={<ExternalLink style={{ width: '1rem', height: '1rem' }} />} label="Physical Location" value={item.location} />
                <DetailItem icon={<ShieldCheck style={{ width: '1rem', height: '1rem' }} />} label="Discovery Context" value="Found near campus bench, appeared abandoned." />
             </DetailSection>
          </div>

          {/* Right Column: Ownership / Claims */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
             <DetailSection title="Claimant Information">
                {item.status === 'CLAIM_PENDING' ? (
                   <div style={{ backgroundColor: 'rgba(30, 47, 133, 0.03)', border: '1px solid rgba(30, 47, 133, 0.1)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                         <div style={{ width: '3rem', height: '3rem', backgroundColor: '#1E2F85', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                            <User style={{ width: '1.5rem', height: '1.5rem' }} />
                         </div>
                         <div>
                            <p style={{ fontSize: '10px', fontWeight: 900, color: '#1E2F85', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Active Claimant</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>Johnathan Doe</p>
                         </div>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.6', fontWeight: '500', margin: 0 }}>Verified student ID. Claiming ownership of this item based on report #RC-9921.</p>
                   </div>
                ) : (
                   <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderStyle: 'dashed', borderRadius: '1.5rem', padding: '2.5rem', textAlign: 'center' }}>
                      <User style={{ width: '2rem', height: '2rem', color: '#E2E8F0', marginLeft: 'auto', marginRight: 'auto', marginBottom: '0.75rem' }} />
                      <p style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>No Active Claims</p>
                      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem', margin: 0 }}>This item is currently unclaimed.</p>
                   </div>
                )}
             </DetailSection>
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem', borderTop: '1px solid #F1F5F9', backgroundColor: 'rgba(248, 250, 252, 0.5)', display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          onClick={onClose}
          style={{ paddingLeft: '2rem', paddingRight: '2rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: '#111827', color: '#FFFFFF', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          Close Detail View
        </Button>
      </div>
    </div>
  )
}

function DetailSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
       <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.25em', margin: 0 }}>{title}</h3>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {children}
       </div>
    </div>
  )
}

function DetailItem({ icon, label, value, active }: { icon: React.ReactNode, label: string, value: string, active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #F8FAFC', paddingBottom: '0.75rem' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: '#E2E8F0', display: 'flex', alignItems: 'center' }}>{icon}</div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B' }}>{label}</span>
       </div>
       <span style={{ fontSize: '0.75rem', fontWeight: 900, color: active ? '#1E2F85' : '#0F172A' }}>{value}</span>
    </div>
  )
}

