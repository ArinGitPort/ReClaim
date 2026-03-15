import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LandingPage } from "@/pages/LandingPage"
import { GalleryPage } from "@/pages/GalleryPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ThemeProvider } from "@/components/theme-provider"
import "./index.css"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="reclaim-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
