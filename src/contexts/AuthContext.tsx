import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { api, clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api"
import { disconnectRealtimeSocket } from "@/lib/realtime"

interface User {
  id: string
  name: string
  studentId?: string | null
  email: string
  phone?: string | null
  department?: string | null
  notificationPreferences?: {
    claimUpdates: boolean
    reportUpdates: boolean
    pickupReminders: boolean
  } | null
  role: "STUDENT" | "STAFF" | "ADMIN"
  status?: string
  passwordResetRequired?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: { name: string; email: string; password: string; studentId?: string }) => Promise<void>
  refreshUser: () => Promise<void>
  setCurrentUser: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const response = await api.get<{ user: User }>("/auth/me")
    setUser(response.data.user)
  }, [])

  useEffect(() => {
    async function hydrateUser(): Promise<void> {
      const token = getStoredToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        await refreshUser()
      } catch {
        clearStoredToken()
        disconnectRealtimeSocket()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void hydrateUser()
  }, [refreshUser])

  const login = useCallback<AuthContextType["login"]>(async (email, password) => {
    const response = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    })

    setStoredToken(response.data.token)
    setUser(response.data.user)
  }, [])

  const register = useCallback<AuthContextType["register"]>(async (input) => {
    await api.post("/auth/register", {
      ...input,
      role: "STUDENT",
    })

    await login(input.email, input.password)
  }, [login])

  const logout = useCallback(() => {
    disconnectRealtimeSocket()
    clearStoredToken()
    setUser(null)
  }, [])

  const setCurrentUser = useCallback((nextUser: User) => {
    setUser(nextUser)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      refreshUser,
      setCurrentUser,
      logout,
    }),
    [isLoading, login, logout, refreshUser, register, setCurrentUser, user]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
