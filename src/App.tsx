import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Public pages
import { LandingPage } from "@/pages/public/LandingPage"
import { RegisterPage } from "@/pages/public/RegisterPage"

// User pages
import { GalleryPage } from "@/pages/user/GalleryPage"
import { ReportLostPage } from "@/pages/user/ReportLostPage"
import { MyClaimsPage } from "@/pages/user/MyClaimsPage"
import { MyReportsPage } from "@/pages/user/MyReportsPage"
import { ReadyToClaimPage } from "@/pages/user/ReadyToClaimPage"
import { UserNotificationsPage } from "@/pages/user/UserNotificationsPage"
import { UserProfilePage } from "@/pages/user/UserProfilePage"
import { UserSettingsPage } from "@/pages/user/UserSettingsPage"

// Layouts
import { AppLayout } from "@/layouts/AppLayout"
import { AdminLayout } from "@/layouts/admin/AdminLayout"

// Contexts
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { TooltipProvider } from "@/components/ui/tooltip"

// Admin pages
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { InventoryPage } from "@/pages/admin/InventoryPage"
import { MissingItemsPage } from "@/pages/admin/MissingItemsPage"
import { ClaimsVerificationPage } from "@/pages/admin/ClaimsVerificationPage"
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage"
import { HandoverLogPage } from "@/pages/admin/HandoverLogPage"
import { UserDirectoryPage } from "@/pages/admin/UserDirectoryPage"
import { ExpiredInventoryPage } from "@/pages/admin/ExpiredInventoryPage"
import { AdminProfilePage } from "@/pages/admin/AdminProfilePage"
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage"
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage"
import { CapturedItemsPage } from "@/pages/admin/CapturedItemsPage"
import { CampusCamerasPage } from "@/pages/admin/CampusCamerasPage"
import { SnapshotGalleryPage } from "@/pages/admin/SnapshotGalleryPage"

import { useEffect } from "react"
// import "./index.css" // DECOMMISSIONED for academic compliance

function GlobalStyles() {
  useEffect(() => {
    // Injecting core global styles to replace index.css
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.fontFamily = "'Outfit', sans-serif"
    document.body.style.backgroundColor = '#FFFFFF'
    document.body.style.color = '#0F172A'
    document.body.style.overflowX = 'hidden'
    document.body.style.minHeight = '100vh'
    ;(document.body.style as any).webkitFontSmoothing = 'antialiased'
    ;(document.body.style as any).mozOsxFontSmoothing = 'grayscale'
  }, [])
  return null
}

function ProtectedUserRoutes() {
  // Authentication checks temporarily disabled for UI route testing
  return <AppLayout />
}

function ProtectedAdminRoutes() {
  // Authentication checks temporarily disabled for UI route testing
  return <AdminLayout />
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="reclaim-theme">
      <GlobalStyles />
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider delayDuration={150}>
            <Router>
              <Routes>
              {/* Public / Unauthenticated Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected / Authenticated Routes with Sidebar Navigation */}
            <Route element={<ProtectedUserRoutes />}>
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/report-lost" element={<ReportLostPage />} />
              <Route path="/my-claims" element={<MyClaimsPage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/ready-to-claim" element={<ReadyToClaimPage />} />
              <Route path="/notifications" element={<UserNotificationsPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/settings" element={<UserSettingsPage />} />
              <Route path="/office" element={<div style={{ padding: '2rem' }}>Campus Admin Office Map Template</div>} />
            </Route>

            {/* Administrative Dashboard Routes */}
            <Route path="/admin" element={<ProtectedAdminRoutes />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="captured-items" element={<CapturedItemsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<MissingItemsPage />} />
              <Route path="claims" element={<ClaimsVerificationPage />} />
              <Route path="handover-log" element={<HandoverLogPage />} />
              <Route path="user-directory" element={<UserDirectoryPage />} />
              <Route path="expired-inventory" element={<ExpiredInventoryPage />} />
              <Route path="logs" element={<AuditLogsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="cameras" element={<CampusCamerasPage />} />
              <Route path="snapshots" element={<SnapshotGalleryPage />} />
            </Route>
              </Routes>
            </Router>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
