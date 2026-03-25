import { X, Link2, Search, Info, Package } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useState } from "react"

interface InventoryLinkReportModalProps {
  item: any
  onClose: () => void
  onLinked: () => void
}

export function InventoryLinkReportModal({ item, onClose, onLinked }: InventoryLinkReportModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLinking, setIsLinking] = useState(false)

  const handleLink = () => {
    setIsLinking(true)
    setTimeout(() => {
       setIsLinking(false)
       onLinked()
    }, 1200)
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <div style={{ padding: '0.5rem', backgroundColor: '#F0F9FF', borderRadius: '0.75rem' }}>
              <Link2 style={{ width: '1.25rem', height: '1.25rem', color: '#0284C7' }} />
           </div>
           <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Match with Lost Report</h2>
              <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '500', margin: 0 }}>Link this found item to a student's lost claim.</p>
           </div>
        </div>
        <button onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Item Summary Card */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: '0.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Package style={{ width: '1.25rem', height: '1.25rem', color: '#D1D5DB' }} />
              </div>
              <div>
                 <p style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: '1', marginBottom: '0.25rem', margin: 0 }}>Found Item</p>
                 <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>{item.title}</p>
              </div>
           </div>
           <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold', color: '#94A3B8', backgroundColor: '#FFFFFF', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #F1F5F9' }}>{item.code}</span>
        </div>

        {/* Search Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
              <input 
                 type="text" 
                 placeholder="Search reports by student name, ID, or item title..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold', outline: 'none', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              />
           </div>

           {/* Mock Results */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <ReportSuggestion name="Sarah Jenkins" reportId="LR-2900" title="Lost Silver Ring" date="2 hours ago" onSelect={handleLink} disabled={isLinking} />
              <ReportSuggestion name="Mike Peterson" reportId="LR-2850" title="Missing Keys" date="May 14" onSelect={handleLink} disabled={isLinking} />
           </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(248, 250, 252, 0.5)', borderTop: '1px solid #F1F5F9' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
            <Info style={{ width: '1.25rem', height: '1.25rem', color: '#0284C7', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#64748B', lineHeight: '1.6', fontStyle: 'italic', margin: 0 }}>
               Linking will notify the student that their item has been potentially found. Final verification remains required before handover.
            </p>
         </div>
      </div>
    </div>
  )
}

function ReportSuggestion({ name, reportId, title, date, onSelect, disabled }: { name: string, reportId: string, title: string, date: string, onSelect: () => void, disabled?: boolean }) {
  const avatarBg = '#F8FAFC'
  const avatarColor = '#94A3B8'

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: avatarColor, fontWeight: 900, fontSize: '10px' }}>
             {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
             <p style={{ fontSize: '0.875rem', fontWeight: 900, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                {name} 
                <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold', color: '#94A3B8' }}>{reportId}</span>
             </p>
             <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748B', marginTop: '0.125rem', margin: 0 }}>{title} • <span style={{ color: '#94A3B8' }}>{date}</span></p>
          </div>
       </div>
       <Button 
          variant="outline" 
          onClick={onSelect}
          disabled={disabled}
          style={{ height: '2rem', borderRadius: '0.5rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: '2px solid #E2E8F0', backgroundColor: 'transparent', cursor: 'pointer' }}
       >
          Select Match
       </Button>
    </div>
  )
}
