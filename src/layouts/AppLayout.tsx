import { Outlet } from "react-router-dom"
import { TopNavBar } from "@/layouts/TopNavBar"

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans w-full">
      {/* Enhanced Top Navigation */}
      <TopNavBar />

      {/* Centered Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
