import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Public pages
import { LandingPage } from "@/pages/public/LandingPage"
import { RegisterPage } from "@/pages/public/RegisterPage"

// User pages
import { GalleryPage } from "@/pages/user/GalleryPage"
import { ReportLostPage } from "@/pages/user/ReportLostPage"
import { MyClaimsPage } from "@/pages/user/MyClaimsPage"
import { MyReportsPage } from "@/pages/user/MyReportsPage"

// Layouts
import { AppLayout } from "@/layouts/AppLayout"
import { AdminLayout } from "@/layouts/admin/AdminLayout"

// Contexts
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"

// Admin pages
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { InventoryPage } from "@/pages/admin/InventoryPage"
import { MissingItemsPage } from "@/pages/admin/MissingItemsPage"
import { ClaimsVerificationPage } from "@/pages/admin/ClaimsVerificationPage"
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage"
import { HandoverLogPage } from "@/pages/admin/HandoverLogPage"
import { UserDirectoryPage } from "@/pages/admin/UserDirectoryPage"
import { ExpiredInventoryPage } from "@/pages/admin/ExpiredInventoryPage"
import { SettingsPage } from "@/pages/admin/SettingsPage"

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
              {/* Placeholder routes */}
              <Route path="/settings" element={<div className="p-8">Settings Page Template</div>} />
              <Route path="/office" element={<div className="p-8">Campus Admin Office Map Template</div>} />
            </Route>

            {/* Administrative Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<MissingItemsPage />} />
              <Route path="claims" element={<ClaimsVerificationPage />} />
              <Route path="handover-log" element={<HandoverLogPage />} />
              <Route path="user-directory" element={<UserDirectoryPage />} />
              <Route path="expired-inventory" element={<ExpiredInventoryPage />} />
              <Route path="logs" element={<AuditLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
