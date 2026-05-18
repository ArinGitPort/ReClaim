import { type FormEvent, useEffect, useState } from "react"
import { AxiosError } from "axios"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { defaultNotificationPreferences, type NotificationPreferences } from "./types"

export function useUserSettings() {
  const { user, setCurrentUser } = useAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [department, setDepartment] = useState("")
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setName(user.name ?? "")
    setPhone(user.phone ?? "")
    setDepartment(user.department ?? "")
    setPreferences({ ...defaultNotificationPreferences, ...(user.notificationPreferences ?? {}) })
  }, [user])

  async function saveProfile(event?: FormEvent) {
    event?.preventDefault()
    setIsSavingProfile(true)
    setError(null)

    try {
      const response = await api.patch("/auth/me", {
        name: name.trim(),
        phone: phone.trim() || null,
        department: department.trim() || null,
        notificationPreferences: preferences,
      })
      setCurrentUser(response.data.user)
      flashSaved("Profile saved")
    } catch (err) {
      setError(readError(err, "Unable to save profile settings."))
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.")
      return
    }

    setIsSavingPassword(true)
    try {
      const response = await api.patch("/auth/password", {
        currentPassword,
        newPassword,
      })
      setCurrentUser(response.data.user)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      flashSaved("Password updated")
    } catch (err) {
      setError(readError(err, "Unable to update password."))
    } finally {
      setIsSavingPassword(false)
    }
  }

  function flashSaved(message: string) {
    setSavedMessage(message)
    window.setTimeout(() => setSavedMessage(null), 3000)
  }

  return {
    user,
    name,
    setName,
    phone,
    setPhone,
    department,
    setDepartment,
    preferences,
    setPreferences,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSavingProfile,
    isSavingPassword,
    savedMessage,
    error,
    saveProfile,
    savePassword,
  }
}

function readError(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as { error?: string } | undefined)?.error ?? fallback
  }
  return fallback
}
