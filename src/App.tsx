import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LandingPage } from "@/pages/LandingPage"
import { GalleryPage } from "@/pages/GalleryPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ReportLostPage } from "@/pages/ReportLostPage"
import { MyClaimsPage } from "@/pages/MyClaimsPage"
import { MyReportsPage } from "@/pages/MyReportsPage"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { AdminInventoryPage } from "@/pages/admin/AdminInventoryPage"
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage"
import { AdminClaimsPage } from "@/pages/admin/AdminClaimsPage"
import { AdminLogsPage } from "@/pages/admin/AdminLogsPage"
import { AdminHandoverLogPage } from "@/pages/admin/AdminHandoverLogPage"
import { AdminUserDirectoryPage } from "@/pages/admin/AdminUserDirectoryPage"
import { AdminExpiredInventoryPage } from "@/pages/admin/AdminExpiredInventoryPage"
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage"
import { AppLayout } from "@/components/AppLayout"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/features/auth/AuthContext"
import "./index.css"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="reclaim-theme">
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public / Unauthenticated Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected / Authenticated Routes with Sidebar Navigation */}
          <Route element={<AppLayout />}>
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/report-lost" element={<ReportLostPage />} />
            <Route path="/my-claims" element={<MyClaimsPage />} />
            <Route path="/my-reports" element={<MyReportsPage />} />
            {/* Placeholder routes that will just render an empty view inside the layout for now */}
            <Route path="/settings" element={<div className="p-8">Settings Page Template</div>} />
            <Route path="/office" element={<div className="p-8">Campus Admin Office Map Template</div>} />
          </Route>

          {/* Administrative Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="claims" element={<AdminClaimsPage />} />
            <Route path="handover-log" element={<AdminHandoverLogPage />} />
            <Route path="user-directory" element={<AdminUserDirectoryPage />} />
            <Route path="expired-inventory" element={<AdminExpiredInventoryPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
