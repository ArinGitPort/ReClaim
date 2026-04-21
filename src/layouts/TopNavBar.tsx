import { Search, PlusCircle, BookmarkCheck, Menu, X, Hand, FileText, Settings, MapPin, LogOut } from "lucide-react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { ThemeToggle } from "@/layouts/ThemeToggle"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { NotificationDropdown } from "./NotificationDropdown"
import { ProfileDropdown } from "./ProfileDropdown"
import { useAuth } from "@/contexts/AuthContext"

export function TopNavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background-app/80 backdrop-blur-md border-b border-border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-1 group">
              <span className="text-xl font-black tracking-tight text-text-primary">
                <span className="text-brand">Re</span>Claim
              </span>
            </Link>
          </div>

          {/* Center: Main Navigation (Desktop) */}
          {user && (
            <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
              <NavLink
                to="/gallery"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:text-text-primary hover:bg-background-subtle/50"
                  )
                }
              >
                <Search className="w-4 h-4" />
                Browse
              </NavLink>
              <NavLink
                to="/report-lost"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:text-text-primary hover:bg-background-subtle/50"
                  )
                }
              >
                <PlusCircle className="w-4 h-4" />
                Report Lost
              </NavLink>
              <NavLink
                to="/my-claims"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:text-text-primary hover:bg-background-subtle/50"
                  )
                }
              >
                <BookmarkCheck className="w-4 h-4" />
                My Claims
              </NavLink>
            </nav>
          )}
          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <ThemeToggle />

            {user && (
              <>
                <NotificationDropdown />

                <div className="h-6 w-px bg-border-divider hidden sm:block"></div>

                <div className="hidden md:block pl-1">
                  <ProfileDropdown />
                </div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 -mr-2 text-text-secondary hover:text-brand transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background-app border-b border-border-divider shadow-md flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 flex flex-col gap-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 px-3 mt-2">Core Actions</h4>

            <MobileNavItem to="/gallery" icon={<Search className="w-5 h-5" />} label="Browse Found Items" />
            <MobileNavItem to="/report-lost" icon={<PlusCircle className="w-5 h-5" />} label="Report a Lost Item" />

            <div className="h-px w-full bg-border-divider my-3" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 px-3">Tracking & Status</h4>

            <MobileNavItem to="/my-claims" icon={<Hand className="w-5 h-5" />} label="My Claims" />
            <MobileNavItem to="/my-reports" icon={<FileText className="w-5 h-5" />} label="My Lost Reports" />

            <div className="h-px w-full bg-border-divider my-3" />

            <MobileNavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Profile Settings" />
            <MobileNavItem to="/office" icon={<MapPin className="w-5 h-5" />} label="Campus Admin Office" />
            
            {/* The Logout Button now actually calls logout */}
            <button
              onClick={() => {
                if (logout) logout()
                navigate("/")
                setIsMobileMenuOpen(false)
              }}
              className="flex flex-row items-center gap-3 px-3 py-3 rounded-md transition-colors text-status-error hover:bg-status-error/10 w-full text-left"
            >
              <div className="transition-transform"><LogOut className="w-5 h-5" /></div>
              <span className="text-sm flex-1 font-medium">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function MobileNavItem({ to, icon, label, variant = "default" }: { to: string, icon: React.ReactNode, label: string, variant?: "default" | "danger" }) {        
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + "/")

  return (
    <NavLink
      to={to}
      className={cn(
        "flex flex-row items-center gap-3 px-3 py-3 rounded-md transition-colors", 
        variant === "danger"
          ? "text-status-error hover:bg-status-error/10"
          : isActive
            ? "bg-brand/10 text-brand font-medium"
            : "text-text-secondary hover:bg-background-subtle/50 hover:text-text-primary"     
      )}
    >
      <div className={cn("transition-transform", isActive && "scale-105")}>{icon}</div>
      <span className="text-sm flex-1">{label}</span>
    </NavLink>
  )
}
