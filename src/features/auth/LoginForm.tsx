import React, { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { User, Lock } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)

      const me = await api.get<{ user: { role: "ADMIN" | "STAFF" | "STUDENT" } }>("/auth/me")
      if (me.data.user.role === "ADMIN" || me.data.user.role === "STAFF") {
        navigate("/admin/dashboard")
      } else {
        navigate("/gallery")
      }
    } catch {
      setError("Login failed. Check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-3xl font-bold text-text-primary text-center tracking-tight">Login</h2>
        <p className="text-text-secondary text-base mt-2 text-center">
          Sign in with your campus ID to manage reports and claims.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 relative">
          <label className="text-sm font-semibold text-text-primary ml-1 block">
            Email Address
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
            <Input
              type="email"
              placeholder="admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 bg-background-subtle focus:bg-background-app text-base transition-colors border-border-divider/50"
              required
            />
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-sm font-semibold text-text-primary ml-1 block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12 bg-background-subtle focus:bg-background-app text-base transition-colors border-border-divider/50"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mt-4">
          <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary transition-colors font-medium">
            <input type="checkbox" className="rounded border-border-divider text-brand focus:ring-brand w-4 h-4 bg-background-subtle" />
            Remember me
          </label>
          <a href="#" className="text-brand hover:text-brand/80 font-semibold transition-colors">
            Forgot Password?
          </a>
        </div>

        {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full mt-6 h-12 text-base font-semibold shadow hover:shadow-md transition-shadow text-white">
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  )
}


