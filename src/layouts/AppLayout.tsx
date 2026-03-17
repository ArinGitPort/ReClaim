import { Outlet } from "react-router-dom"
import { Sidebar } from "@/layouts/Sidebar"
import { MobileNav } from "@/layouts/MobileNav"

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 font-sans w-full">
      {/* Mobile Header and Dropdown Menu */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative">
        <Outlet />
      </main>
    </div>
  )
}
