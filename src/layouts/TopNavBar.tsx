import { ArrowLeft, Bell, User, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { ThemeToggle } from "@/layouts/ThemeToggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { CampusDropOffModal } from "@/components/user/CampusDropOffModal"
import { Button } from "@/components/ui/Button"

interface TopNavBarProps {
  title?: string
  backLink?: string
  backLabel?: string
}

export function TopNavBar({ 
  title = "Campus Lost & Found", 
  backLink = "/", 
  backLabel = "Back" 
}: TopNavBarProps) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const [showDropOffModal, setShowDropOffModal] = useState(false)

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to={backLink} style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none' }}>
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              {backLabel}
            </Link>
            <div style={{ height: '1.5rem', width: '1px', backgroundColor: '#E2E8F0', display: 'block' }}></div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: '#0F172A', display: 'block', margin: 0 }}>
              {title}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Found Item Trigger */}
            <Button 
              onClick={() => setShowDropOffModal(true)}
              style={{ display: 'flex', backgroundColor: '#1E2F85', color: '#FFFFFF', fontWeight: 'bold', height: '2.25rem', padding: '0 1rem', borderRadius: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: 'none', cursor: 'pointer' }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              I Found an Item
            </Button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
              <Link to="/notifications" style={{ position: 'relative', padding: '0.5rem', color: '#64748B', borderRadius: '50%', textDecoration: 'none', display: 'inline-flex' }}>
                <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', minWidth: '1.25rem', height: '1.25rem', padding: '0 0.25rem', backgroundColor: '#EF4444', border: '2px solid #FFFFFF', borderRadius: '9999px', fontSize: '10px', fontWeight: 'bold', color: '#FFFFFF', display: 'grid', placeItems: 'center' }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </div>

            <div style={{ height: '2rem', width: '1px', backgroundColor: '#E2E8F0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0F172A', lineHeight: '1' }}>{user?.name}</span>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '500' }}>Student Account</span>
              </div>
              <button style={{ width: '2.25rem', height: '2.25rem', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer', padding: 0 }}>
                <User style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {showDropOffModal && (
        <CampusDropOffModal onClose={() => setShowDropOffModal(false)} />
      )}
    </>
  )
}
