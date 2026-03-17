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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans w-full text-slate-900">
      {/* Mobile Sticky Nav handles its own dropdown */}
      <AdminMobileNav />
      
      {/* Desktop Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AdminTopNavBar />
        <main 
          className="flex-1 p-4 md:p-8"
        >
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
