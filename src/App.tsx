import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LandingPage } from "@/pages/LandingPage"
import { GalleryPage } from "@/pages/GalleryPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ReportLostPage } from "@/pages/ReportLostPage"
import { MyClaimsPage } from "@/pages/MyClaimsPage"
import { MyReportsPage } from "@/pages/MyReportsPage"
import { AppLayout } from "@/components/AppLayout"
import { ThemeProvider } from "@/components/theme-provider"
import "./index.css"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="reclaim-theme">
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
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
