import { Outlet } from "react-router-dom"
import { Sidebar } from "@/layouts/Sidebar"
import { MobileNav } from "@/layouts/MobileNav"
import { useIsMobile } from "@/hooks/useIsMobile"

export function AppLayout() {
  const isMobile = useIsMobile()

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      backgroundColor: '#F1F5F9', 
      width: '100%', 
      fontFamily: 'sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Mobile Header and Dropdown Menu */}
      {isMobile && <MobileNav />}

      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0, 
        overflowX: 'hidden', 
        position: 'relative',
        width: '100%'
      }}>
        <Outlet />
      </main>
    </div>
  )
}
