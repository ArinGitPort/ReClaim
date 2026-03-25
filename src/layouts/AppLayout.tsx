import { Outlet } from "react-router-dom"
import { Sidebar } from "@/layouts/Sidebar"
import { MobileNav } from "@/layouts/MobileNav"

export function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', backgroundColor: '#F1F5F9', width: '100%', fontFamily: 'sans-serif' }}>
      {/* Mobile Header and Dropdown Menu */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden', position: 'relative' }}>
        <Outlet />
      </main>
    </div>
  )
}
