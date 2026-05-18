import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"

// Public pages
import { LandingPage } from "@/pages/public/PublicLandingPage"
import { RegisterPage } from "@/pages/public/PublicRegisterPage"
import { ForgotPasswordPage } from "@/pages/public/PublicForgotPasswordPage"

// User pages
import { GalleryPage } from "@/pages/user/UserGalleryPage"
import { ReportLostPage } from "@/pages/user/UserReportLostPage"
import { MyClaimsPage } from "@/pages/user/UserMyClaimsPage"
import { MyReportsPage } from "@/pages/user/UserMyReportsPage"
import { ReadyToClaimPage } from "@/pages/user/UserReadyToClaimPage"
import { NotificationsPage } from "@/pages/user/UserNotificationsPage"
import { SettingsPage as UserSettingsPage } from "@/pages/user/UserSettingsPage"
import { UserCampusOfficePage } from "@/pages/user/UserCampusOfficePage"

// Layouts
import { AppLayout } from "@/layouts/AppLayout"
import { AdminLayout } from "@/layouts/admin/AdminLayout"

// Contexts
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { Toaster } from "@/components/ui/sonner"

// Admin pages
import { DashboardPage } from "@/pages/admin/AdminDashboardPage"
import { InventoryPage } from "@/pages/admin/AdminInventoryPage"
import { MissingItemsPage } from "@/pages/admin/AdminMissingItemsPage"
import { ClaimsVerificationPage } from "@/pages/admin/AdminClaimsVerificationPage"
import { AuditLogsPage } from "@/pages/admin/AdminAuditLogsPage"
import { HandoverLogPage } from "@/pages/admin/AdminHandoverLogPage"
import { UserDirectoryPage } from "@/pages/admin/AdminUserDirectoryPage"
import { DeletedItemsPage } from "@/pages/admin/AdminDeletedItemsPage"
import { SettingsPage } from "@/pages/admin/AdminSettingsPage"
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage"
import { SnapshotGalleryPage } from "@/pages/admin/AdminSnapshotGalleryPage"
import { DismissedSnapshotsPage } from "@/pages/admin/AdminDismissedSnapshotsPage"
import { CameraSettingsPage } from "@/pages/admin/AdminCameraSettingsPage"
import { LiveMonitorPage } from "@/pages/admin/AdminLiveMonitorPage"

import "./index.css"
import { useAuth } from "@/contexts/AuthContext"

function PublicOnlyRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-500 font-semibold">Loading session...</div>
  }

  if (user) {
    if (user.role === "ADMIN" || user.role === "STAFF") {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/gallery" replace />
  }

  return <Outlet />
}

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
          <Toaster />
          <Router>
            <Routes>
            {/* Public / Unauthenticated Routes */}
            <Route element={<PublicOnlyRoutes />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
            
            {/* Protected / Authenticated Routes with Sidebar Navigation */}
            <Route element={<ProtectedUserRoutes />}>
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/report-lost" element={<ReportLostPage />} />
              <Route path="/my-claims" element={<MyClaimsPage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/ready-to-claim" element={<ReadyToClaimPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              {/* Settings Route */}
              <Route path="/settings" element={<UserSettingsPage />} />
              <Route path="/office" element={<UserCampusOfficePage />} />
              <Route path="*" element={<Navigate to="/gallery" replace />} />
            </Route>

            {/* Administrative Dashboard Routes */}
            <Route path="/admin" element={<ProtectedAdminRoutes />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="live-monitor" element={<LiveMonitorPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<MissingItemsPage />} />
              <Route path="snapshots" element={<SnapshotGalleryPage />} />
              <Route path="dismissed-snapshots" element={<DismissedSnapshotsPage />} />
              <Route path="claims" element={<ClaimsVerificationPage />} />
              <Route path="handover-log" element={<HandoverLogPage />} />
              <Route path="user-directory" element={<UserDirectoryPage />} />
              <Route path="deleted-items" element={<DeletedItemsPage />} />
              <Route path="expired-inventory" element={<Navigate to="/admin/deleted-items" replace />} />
              <Route path="logs" element={<AuditLogsPage />} />
              <Route path="camera-settings" element={<CameraSettingsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
