import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AdminSidebar } from "@/layouts/admin/AdminSidebar"
import { AdminTopNavBar } from "@/layouts/admin/AdminTopNavBar"
import { AdminMobileNav } from "@/layouts/admin/AdminMobileNav"

export function AdminLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', backgroundColor: '#F8FAFC', width: '100%', color: '#0F172A', boxSizing: 'border-box' }}>
      {/* Mobile Sticky Nav handles its own dropdown */}
      <AdminMobileNav />
      
      {/* Desktop Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <AdminTopNavBar />
        <main 
          style={{ flex: 1, padding: '2rem' }}
        >
          <div style={{ maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
