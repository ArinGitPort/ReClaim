import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  studentId: string
  email: string
  role: "student" | "staff" | "admin"
}

interface AuthContextType {
  user: User | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock User for development
const mockUser: User = {
  id: "user_123",
  name: "Juan Dela Cruz",
  studentId: "2020-123456",
  email: "juan.delacruz@students.nu.edu.ph",
  role: "student"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser) // Defaulting to logged in for dev

  const login = () => setUser(mockUser)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
