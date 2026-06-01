import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAuth } from "@/contexts/AuthContext"

export function useLogoutConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  function requestLogout() {
    setIsOpen(true)
  }

  function confirmLogout() {
    logout()
    setIsOpen(false)
    navigate("/", { replace: true })
  }

  const logoutConfirmation = (
    <ConfirmModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={confirmLogout}
      title="Log Out?"
      message="You will be signed out of this session and returned to the public page. Any unsaved form changes on the current page may be lost."
      confirmText="Log Out"
      cancelText="Stay Signed In"
      isDestructive
    />
  )

  return {
    requestLogout,
    logoutConfirmation,
  }
}

