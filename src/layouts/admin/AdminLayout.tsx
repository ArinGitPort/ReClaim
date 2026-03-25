import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AdminSidebar } from "@/layouts/admin/AdminSidebar"
import { AdminTopNavBar } from "@/layouts/admin/AdminTopNavBar"
import { AdminMobileNav } from "@/layouts/admin/AdminMobileNav"
import { useIsMobile } from "@/hooks/useIsMobile"

export function AdminLayout() {
  const { pathname } = useLocation()
  const isMobile = useIsMobile()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div style={{ 
      height: isMobile ? 'auto' : '100vh', 
      minHeight: '100vh',
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      backgroundColor: '#F8FAFC', 
      width: '100%', 
      color: '#0F172A', 
      boxSizing: 'border-box',
      overflow: isMobile ? 'visible' : 'hidden'
    }}>
      {/* Mobile Sticky Nav handles its own dropdown */}
      {isMobile && <AdminMobileNav />}
      
      {/* Desktop Sidebar */}
      {!isMobile && <AdminSidebar />}
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0, 
        position: 'relative', 
        height: isMobile ? 'auto' : '100%' 
      }}>
        {!isMobile && <AdminTopNavBar />}
        <main 
          style={{ 
            flex: 1, 
            padding: isMobile ? '1rem' : '2rem', 
            overflowY: isMobile ? 'visible' : 'auto' 
          }}
        >
          <div style={{ maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
