import { useEffect, useMemo, useState } from "react"
import { 
  Search, 
  X, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Filter,
  ArrowRightLeft
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { api } from "@/lib/api"

type InventoryMatch = {
  id: string
  code: string
  title: string
  category: string
  color: string
  date: string
  location: string
  status: string
  matchScore: number
}

type MatchPrefill = {
  category: string
  color: string
  dateFrom: string
}

export function MatchLinkingModal({ onClose, onLinked, reportId, reportCode, itemTitle, prefill }: { onClose: () => void; onLinked?: (matchedItemId: string) => void; reportId: string; reportCode: string; itemTitle: string; prefill?: MatchPrefill }) {
  const [isLinking, setIsLinking] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inventoryMatches, setInventoryMatches] = useState<InventoryMatch[]>([])

  const normalizedDate = prefill?.dateFrom ? new Date(prefill.dateFrom).toLocaleDateString() : null
  const prefillHint = prefill
    ? `Category: ${prefill.category} • Color: ${prefill.color}${normalizedDate ? ` • Date >= ${normalizedDate}` : ""}`
    : null
  const defaultSearchValue = [itemTitle, prefill?.color, prefill?.category].filter(Boolean).join(" ")

  useEffect(() => {
    setSearchText(defaultSearchValue)
  }, [defaultSearchValue])

  useEffect(() => {
    async function loadInventory(): Promise<void> {
      setIsLoading(true)
      setError(null)
      try {
        const response = await api.get<{
          items: Array<{
            id: string
            code: string
            title: string
            category: string
            color: string
            foundAtUtc: string
            foundLocation: string
            status: string
          }>
        }>("/items/admin", {
          params: searchText.trim() ? { search: searchText.trim() } : undefined,
        })

        setInventoryMatches(
          response.data.items
            .filter((item) => item.status === "AVAILABLE")
            .map((item) => ({
              id: item.id,
              code: item.code,
              title: item.title,
              category: item.category,
              color: item.color,
              date: new Date(item.foundAtUtc).toLocaleDateString(),
              location: item.foundLocation,
              status: item.status,
              matchScore: computeMatchScore(item, prefill),
            }))
            .sort((a, b) => b.matchScore - a.matchScore)
        )
      } catch {
        setError("Unable to load inventory matches.")
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadInventory()
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [prefill, searchText])

  const selectedItem = useMemo(
    () => inventoryMatches.find((item) => item.id === selectedMatch),
    [inventoryMatches, selectedMatch]
  )

  const handleLink = async () => {
    if (!selectedItem) {
      return
    }

    setError(null)
    setIsLinking(true)
    try {
      await api.patch(`/reports/${reportId}`, {
        status: "MATCHED",
        matchedItemId: selectedItem.id,
      })

      onLinked?.(selectedItem.id)

      setIsLinking(false)
      setConfirmed(true)
    } catch {
      setIsLinking(false)
      setError("Failed to link report with selected inventory item.")
    }
  }

  if (confirmed) {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: '5rem', height: '5rem', backgroundColor: '#D1FAE5', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)', border: '4px solid #ECFDF5' }}>
          <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem', color: '#059669' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: '1', marginBottom: '0.5rem', margin: 0 }}>Report Linked!</h3>
          <p style={{ color: '#64748B', fontWeight: '500', lineHeight: '1.6', maxWidth: '20rem', marginLeft: 'auto', marginRight: 'auto', fontSize: '0.875rem', margin: 0 }}>
            {reportCode} is connected to {selectedItem?.code ?? "inventory"}. Student can now proceed with claim flow.
          </p>
        </div>
        <Button 
          style={{ width: '100%', height: '3rem', backgroundColor: '#1E2F85', color: '#FFFFFF', fontWeight: 900, borderRadius: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} 
          onClick={onClose}
        >
          Finish Workspace
        </Button>
      </div>
    )
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderRadius: '0.75rem'
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '3rem', height: '3rem', backgroundColor: '#1E2F85', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <ArrowRightLeft style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: '1', margin: 0 }}>Match Linker</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', lineHeight: '1', marginTop: '0.5rem' }}>
               Linking <span style={{ color: '#1E2F85', textDecoration: 'underline', textUnderlineOffset: '4px' }}>{reportId}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ padding: '0.5rem', color: '#94A3B8', backgroundColor: 'transparent', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
      </div>

      {/* Matching Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
        {/* Search Bar */}
        <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
            <Input 
              placeholder="Search Inventory by keywords..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%', padding: '0 1rem 0 3rem', height: '3rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold', outline: 'none', boxShadow: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            />
          </div>
          {prefillHint && (
            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1E2F85', backgroundColor: 'rgba(30, 47, 133, 0.05)', border: '1px solid rgba(30, 47, 133, 0.1)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
              Prefilled criteria: {prefillHint}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {prefill?.category && (
              <Button style={{ backgroundColor: '#FFFFFF', fontSize: '10px', height: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: '0.5rem', padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Filter style={{ width: '0.75rem', height: '0.75rem' }} /> Category: {prefill.category}
              </Button>
            )}
            {prefill?.color && (
              <Button style={{ backgroundColor: '#FFFFFF', fontSize: '10px', height: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: '0.5rem', padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Filter style={{ width: '0.75rem', height: '0.75rem' }} /> Color: {prefill.color}
              </Button>
            )}
          </div>
        </div>

        {/* Matches List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <h4 style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginLeft: '0.25rem', margin: 0 }}>Potential Matches ({inventoryMatches.length})</h4>
           {error && <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#EF4444', margin: 0 }}>{error}</p>}
           {isLoading && <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', margin: 0 }}>Loading inventory candidates...</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {inventoryMatches.map((item) => (
                <MatchCandidateCard
                  key={item.id}
                  item={item}
                  isSelected={selectedMatch === item.id}
                  onClick={() => setSelectedMatch(item.id)}
                />
             ))}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' }}>
        {selectedMatch ? (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.2em', lineHeight: '1', marginBottom: '0.5rem' }}>Ready to Connect</div>
               <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0F172A', letterSpacing: '-0.0125em' }}>Manual verification of ownership confirmed.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button style={{ height: '2.75rem', padding: '0 2rem', border: '1px solid #E2E8F0', borderRadius: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', color: '#64748B', backgroundColor: '#FFFFFF', cursor: 'pointer' }} onClick={() => setSelectedMatch(null)}>Change Choice</Button>
              <Button 
                onClick={handleLink}
                disabled={isLinking || !selectedItem}
                style={{ 
                  height: '2.75rem', 
                  padding: '0 2.5rem', 
                  backgroundColor: '#1E2F85', 
                  color: '#FFFFFF', 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  fontSize: '11px', 
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                  borderRadius: '0.75rem', 
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isLinking ? 0.7 : 1
                }}
              >
                {isLinking ? "Establishing Link..." : "Confirm & Notify"}
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0', textAlign: 'center', color: '#94A3B8' }}>
             <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Select an inventory item to proceed with linking</div>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchCandidateCard({
  item,
  isSelected,
  onClick
}: {
  item: InventoryMatch
  isSelected: boolean
  onClick: () => void
}) {
  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: isSelected ? '1px solid #1E2F85' : '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.2s',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    boxShadow: isSelected ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    zIndex: isSelected ? 10 : 1
  }

  const iconStyle: React.CSSProperties = {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid',
    borderColor: isSelected ? '#1E2F85' : '#E2E8F0',
    backgroundColor: isSelected ? '#1E2F85' : '#F8FAFC',
    color: isSelected ? '#FFFFFF' : '#64748B',
    transition: 'all 0.2s'
  }

  return (
    <div 
      onClick={onClick}
      style={cardStyle}
    >
      <div style={iconStyle}>
        <Package style={{ width: '1.5rem', height: '1.5rem' }} />
      </div>
      
      <div style={{ flex: 1, minWidth: 0, paddingRight: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748B', fontFamily: 'monospace', letterSpacing: '-0.05em' }}>{item.code}</span>
            <StatusBadge weight={item.matchScore} />
          </div>
         <h5 style={{ fontWeight: 'bold', color: '#0F172A', fontSize: '17px', lineHeight: '1.25', marginBottom: '0.5rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.025em' }}>{item.title}</h5>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '11px', fontWeight: 'bold', color: '#64748B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
               <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
               {item.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
               <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
               {item.date}
            </div>
          </div>
      </div>

      <div style={{ 
        position: 'absolute', 
        right: '1.5rem', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        width: '2.25rem', 
        height: '2.25rem', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        border: '1px solid', 
        borderColor: isSelected ? '#1E2F85' : '#E2E8F0', 
        backgroundColor: isSelected ? '#1E2F85' : '#F8FAFC', 
        color: isSelected ? '#FFFFFF' : '#D1D5DB', 
        transition: 'all 0.2s'
      }}>
        {isSelected ? <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem' }} /> : <ArrowRight style={{ width: '1rem', height: '1rem' }} />}
      </div>
    </div>
  )
}

function StatusBadge({ weight }: { weight: number }) {
  const getStyles = (): React.CSSProperties => {
    if (weight > 80) return { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' }
    if (weight > 50) return { backgroundColor: '#FFEDD5', color: '#9A3412', borderColor: '#FED7AA' }
    return { backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0' }
  }

  return (
    <span style={{ 
      padding: '0.125rem 0.5rem', 
      borderRadius: '0.25rem', 
      fontSize: '9px', 
      fontWeight: 900, 
      textTransform: 'uppercase', 
      letterSpacing: '-0.05em', 
      border: '1px solid', 
      ...getStyles() 
    }}>
      {weight}% AI PROBABILITY MATCH
    </span>
  )
}

function computeMatchScore(item: { category: string; color: string }, prefill?: MatchPrefill): number {
  let score = 40
  if (!prefill) {
    return score
  }

  if (item.category.toLowerCase() === prefill.category.toLowerCase()) {
    score += 35
  }

  if (item.color.toLowerCase() === prefill.color.toLowerCase()) {
    score += 25
  }

  return Math.min(score, 99)
}
