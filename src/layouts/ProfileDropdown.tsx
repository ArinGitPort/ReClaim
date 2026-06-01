import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { Link } from "react-router-dom"
import { User, FileText, Settings, MapPin, LogOut, HelpCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { TurnInGuideModal } from "@/features/shared/TurnInGuideModal"
import { useLogoutConfirmation } from "@/hooks/useLogoutConfirmation"

export function ProfileDropdown() {
  const { user } = useAuth()
  const { requestLogout, logoutConfirmation } = useLogoutConfirmation()
  const [isOpen, setIsOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isRightAligned, setIsRightAligned] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)  
  }, [isOpen])

  useLayoutEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      // If the right edge of the menu exceeds the viewport width, force right alignment
      if (rect.right > window.innerWidth - 16) {
        setIsRightAligned(true)
      } else {
        // Reset if there's enough space (we need about half the menu width)
        if (dropdownRef.current) {
          const btnRect = dropdownRef.current.getBoundingClientRect()
          const spaceNeeded = 224 / 2 // w-56 is 224px
          if (window.innerWidth - btnRect.right < spaceNeeded) {
            setIsRightAligned(true)
          } else {
            setIsRightAligned(false)
          }
        }
      }
    }
  }, [isOpen])

  const handleLogout = () => {
    setIsOpen(false)
    requestLogout()
  }

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-1 text-left rounded-md transition-colors focus:outline-none group"
      >
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-xs font-bold text-text-primary leading-none group-hover:text-brand transition-colors">{user?.name || "Student"}</span>
          <span className="text-[10px] text-text-secondary font-medium">Student Account</span>
        </div>
        <div className={cn(
          "w-9 h-9 border rounded-full flex items-center justify-center transition-colors",
          isOpen ? "bg-brand/10 text-brand border-brand/30" : "bg-background-subtle border-border-divider text-text-secondary group-hover:text-brand group-hover:border-brand/40"
        )}>
          <User className="w-5 h-5" />
        </div>
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className={cn(
            "absolute top-full mt-2 w-56 bg-background-app rounded-xl shadow-lg border border-border-divider overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200",
            isRightAligned ? "right-0" : "left-1/2 -translate-x-1/2"
          )}
        >

          {/* Header Mobile / Info */}
          <div className="px-4 py-3 border-b border-border-divider lg:hidden bg-background-app">
            <p className="text-sm font-bold text-text-primary truncate">{user?.name || "Student"}</p>
            <p className="text-xs text-text-secondary font-medium truncate mt-0.5">Student Account</p>
          </div>

          <div className="py-1.5 flex flex-col bg-background-app">
            <Link 
              to="/my-reports" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-subtle transition-colors"
            >
              <FileText className="w-4 h-4" />
              My Lost Reports
            </Link>
            <Link 
              to="/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-subtle transition-colors"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </Link>

            <Link 
              to="/office" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-subtle transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Campus Admin Office
            </Link>

            <div className="px-2 py-1.5">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsGuideOpen(true)
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-brand bg-brand/5 hover:bg-brand/10 transition-colors w-full text-left rounded-lg"
              >
                <HelpCircle className="w-4 h-4 text-brand" />
                Turn In Guide
              </button>
            </div>

            <div className="h-px bg-border-divider my-1.5" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-status-error hover:bg-status-error/10 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      <TurnInGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />
      {logoutConfirmation}
    </div>
  )
}
