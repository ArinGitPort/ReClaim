import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 font-sans w-full">
      {/* Mobile Header and Dropdown Menu */}
      <MobileNav />

      {/* Extracted Sidebar Component (Hidden on Mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative">
        <Outlet />
      </main>
    </div>
  )
}
