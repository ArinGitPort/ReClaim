import { useState, useEffect } from "react"
import { ShieldAlert, Laptop, MapPin, Plus, Clock } from "lucide-react"
import { ClaimThisItemModal } from "@/features/claims/ClaimThisItemModal"
import { getImageUrl } from "@/lib/utils"

export interface FoundItem {
  id: string
  title: string
  category: string
  location: string
  dateLost: string
  isHighValue: boolean
  imageUrl?: string
  status: string
  claimProfile?: {
    electronicItemType?: string | null
  } | null
}

interface ItemCardProps {
  item: FoundItem
  hasActiveClaim?: boolean
  cooldownAvailableAt?: string
}

const getRelativeTime = (dateString: string) => {
  const time = new Date(dateString).getTime();
  if (isNaN(time)) return "Just now";
  const diffHours = Math.round((Date.now() - time) / (1000 * 60 * 60));
  if (diffHours < 24) return `${Math.max(1, diffHours)}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export function ItemCard({ item, hasActiveClaim = false, cooldownAvailableAt }: ItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const isClaimPending = item.status === "CLAIM_PENDING"
  const isOnCooldown = Boolean(cooldownAvailableAt && new Date(cooldownAvailableAt).getTime() > now)
  const isClaimable = !isClaimPending && !hasActiveClaim && !isOnCooldown
  const disabledReason = hasActiveClaim
    ? "You already have an active claim for this item."
    : isOnCooldown && cooldownAvailableAt
      ? `Cooldown active until ${formatFriendlyDateTime(cooldownAvailableAt)}.`
      : isClaimPending
        ? "This item is temporarily reserved while a claim is reviewed."
        : null

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!cooldownAvailableAt) {
      return
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [cooldownAvailableAt])

  // MASONRY RANDOM FACTOR based on ID length or chars to be deterministic
  const randomFactor = item.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 3;
  const desktopHeights = [240, 290, 320];
  const mobileHeights = [180, 210, 240];
  const cardHeight = isMobile ? mobileHeights[randomFactor] : desktopHeights[randomFactor];

  return (
    <>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => { if (isClaimable) setIsModalOpen(true) }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: '100%',
          marginBottom: '16px',
          borderRadius: isMobile ? '12px' : '16px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: isHovered ? '0 12px 24px -8px rgba(0,0,0,0.15)' : '0 4px 12px -4px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          breakInside: 'avoid',
          cursor: isClaimable ? 'pointer' : 'default',
          border: '1px solid #e2e8f0',
          opacity: (isClaimPending || hasActiveClaim || isOnCooldown) ? 0.85 : 1,
        }}
      >
        <div style={{
          height: `${cardHeight}px`,
          width: '100%',
          backgroundColor: item.isHighValue ? '#0f172a' : '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {item.isHighValue ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#fff',
              opacity: 0.85,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.4s ease'
            }}>       
              <Laptop style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa' }}>Secured</span>
            </div>
          ) : item.imageUrl ? (
            <img 
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s ease',
              }}
            />
          ) : (
            <div style={{
              color: '#94a3b8',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.4s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: '#e2e8f0', marginBottom: '8px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>IMG</span>    
              </div>
            </div>
          )}

          {item.isHighValue && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(38, 61, 168, 0.9)',
              backdropFilter: 'blur(4px)',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '9px',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <ShieldAlert style={{ width: '10px', height: '10px' }} />
              HIGH VALUE
            </div>
          )}

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
          }}>
            <h3 style={{
              margin: 0,
              fontWeight: 700,
              fontSize: isMobile ? '14px' : '16px',
              color: '#ffffff',
              lineHeight: 1.25,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {item.title}
            </h3>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isClaimable) setIsModalOpen(true);
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#263DA8',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isClaimable ? 'pointer' : 'not-allowed',
              opacity: (isClaimPending || hasActiveClaim || isOnCooldown) ? 0 : ((isMobile || isHovered) ? 1 : 0),
              transform: (isMobile || isHovered) ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(38, 61, 168, 0.4)'
            }}
            title={disabledReason ?? "Claim this item"}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
          </button>

          {isClaimPending && !hasActiveClaim && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.9)',
              backdropFilter: 'blur(4px)',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '9px',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              <Clock style={{ width: '10px', height: '10px' }} />
              Reserved
            </div>
          )}

          {hasActiveClaim && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(38, 61, 168, 0.9)',
              backdropFilter: 'blur(4px)',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '9px',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              <ShieldAlert style={{ width: '10px', height: '10px' }} />
              Your Claim
            </div>
          )}

          {isOnCooldown && !hasActiveClaim && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(225, 29, 72, 0.9)',
              backdropFilter: 'blur(4px)',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '9px',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              <Clock style={{ width: '10px', height: '10px' }} />
              Cooldown
            </div>
          )}
        </div>

        <div style={{
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          backgroundColor: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px', fontWeight: 500, minWidth: 0 }}>    
              <MapPin style={{ width: '12px', height: '12px', color: '#263DA8', flexShrink: 0 }} />
              <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.location}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
              {getRelativeTime(item.dateLost)}
            </span>
          </div>
          {disabledReason && (
            <p style={{ margin: 0, fontSize: '10px', lineHeight: 1.35, color: '#64748b', fontWeight: 700 }}>
              {disabledReason}
            </p>
          )}
        </div>
      </div>

      <ClaimThisItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemId={item.id}
        itemTitle={item.title}
        itemCategory={item.category}
        itemClaimProfile={item.claimProfile}
        itemImageUrl={item.imageUrl}
        cooldownAvailableAt={cooldownAvailableAt}
      />
    </>
  )
}

function formatFriendlyDateTime(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
