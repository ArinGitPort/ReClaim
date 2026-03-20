import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { api, clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api"
import { disconnectRealtimeSocket } from "@/lib/realtime"

interface User {
  id: string
  name: string
  studentId?: string | null
  email: string
  role: "STUDENT" | "STAFF" | "ADMIN"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: { name: string; email: string; password: string; studentId?: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function hydrateUser(): Promise<void> {
      const token = getStoredToken()
      const isLoggedOut = localStorage.getItem("reclaim_demo_logged_out") === "true"
      
      // FOR UI SKELETON DEMO: Default to Admin if no session exists, UNLESS they specifically logged out
      if (!token && !isLoggedOut) {
        console.log("[AUTH] No token found, defaulting to Admin for demo.")
        setUser({
          id: "u-2",
          name: "Admin Moderator",
          studentId: "STAFF-001",
          email: "admin@national-u.edu.ph",
          role: "ADMIN",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        })
        setIsLoading(false)
        return
      }

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get<{ user: User }>("/auth/me")
        setUser(response.data.user)
      } catch (error) {
        console.error("[AUTH] Hydration failed:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void hydrateUser()
  }, [])

  const login: AuthContextType["login"] = async (email, password) => {
    try {
      localStorage.removeItem("reclaim_demo_logged_out")
      const response = await api.post<{ token: string; user: User }>("/auth/login", {
        email,
        password,
      })
      setStoredToken(response.data.token)
      setUser(response.data.user)
    } catch (error) {
      console.error("[AUTH] Login failed:", error)
      throw error
    }
  }

  const register: AuthContextType["register"] = async (input) => {
    console.log("[MOCK AUTH] Registering user:", input)
    localStorage.removeItem("reclaim_demo_logged_out")
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1000))
    await login(input.email, input.password)
  }

  const logout = () => {
    localStorage.setItem("reclaim_demo_logged_out", "true")
    disconnectRealtimeSocket()
    clearStoredToken()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, user]
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
