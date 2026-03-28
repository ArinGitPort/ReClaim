import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

// Public pages
import { LandingPage } from "@/pages/public/PublicLandingPage"
import { RegisterPage } from "@/pages/public/PublicRegisterPage"

// User pages
import { GalleryPage } from "@/pages/user/UserGalleryPage"
import { ReportLostPage } from "@/pages/user/UserReportLostPage"
import { MyClaimsPage } from "@/pages/user/UserMyClaimsPage"
import { MyReportsPage } from "@/pages/user/UserMyReportsPage"
import { ReadyToClaimPage } from "@/pages/user/UserReadyToClaimPage"
import { NotificationsPage } from "@/pages/user/UserNotificationsPage"

// Layouts
import { AppLayout } from "@/layouts/AppLayout"
import { AdminLayout } from "@/layouts/admin/AdminLayout"

// Contexts
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"

// Admin pages
import { DashboardPage } from "@/pages/admin/AdminDashboardPage"
import { InventoryPage } from "@/pages/admin/AdminInventoryPage"
import { MissingItemsPage } from "@/pages/admin/AdminMissingItemsPage"
import { ClaimsVerificationPage } from "@/pages/admin/AdminClaimsVerificationPage"
import { AuditLogsPage } from "@/pages/admin/AdminAuditLogsPage"
import { HandoverLogPage } from "@/pages/admin/AdminHandoverLogPage"
import { UserDirectoryPage } from "@/pages/admin/AdminUserDirectoryPage"
import { ExpiredInventoryPage } from "@/pages/admin/AdminExpiredInventoryPage"
import { SettingsPage } from "@/pages/admin/AdminSettingsPage"
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage"

import "./index.css"
import { useAuth } from "@/contexts/AuthContext"

function ProtectedUserRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-500 font-semibold">Loading session...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.role === "ADMIN" || user.role === "STAFF") {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <AppLayout />
}

function ProtectedAdminRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-500 font-semibold">Loading session...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return <Navigate to="/gallery" replace />
  }

  return <AdminLayout />
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="reclaim-theme">
      <AuthProvider>
        <NotificationProvider>
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
              <Route path="/notifications" element={<NotificationsPage />} />
              {/* Placeholder routes */}
              <Route path="/settings" element={<div className="p-8">Settings Page Template</div>} />
              <Route path="/office" element={<div className="p-8">Campus Admin Office Map Template</div>} />
            </Route>

            {/* Administrative Dashboard Routes */}
            <Route path="/admin" element={<ProtectedAdminRoutes />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<MissingItemsPage />} />
              <Route path="claims" element={<ClaimsVerificationPage />} />
              <Route path="handover-log" element={<HandoverLogPage />} />
              <Route path="user-directory" element={<UserDirectoryPage />} />
              <Route path="expired-inventory" element={<ExpiredInventoryPage />} />
              <Route path="logs" element={<AuditLogsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
