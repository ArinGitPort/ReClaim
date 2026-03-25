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
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0F172A', textAlign: 'center', letterSpacing: '-0.025em', margin: 0 }}>Login</h2>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '0.5rem', textAlign: 'center', margin: 0 }}>
          Sign in with your campus ID to manage reports and claims.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <User style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#64748B', zIndex: 1 }} />
            <Input
              type="email"
              placeholder="admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#F1F5F9', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#64748B', zIndex: 1 }} />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#F1F5F9', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#64748B', fontWeight: '500' }}>
            <input 
              type="checkbox" 
              style={{ borderRadius: '0.25rem', border: '1px solid #E2E8F0', color: '#1E2F85', width: '1rem', height: '1rem', backgroundColor: '#F1F5F9' }} 
            />
            Remember me
          </label>
          <a href="#" style={{ color: '#1E2F85', textDecoration: 'none', fontWeight: '600' }}>
            Forgot Password?
          </a>
        </div>

        {error && <p style={{ fontSize: '0.875rem', color: '#E11D48', fontWeight: '600', margin: 0 }}>{error}</p>}

        <Button 
          type="submit" 
          disabled={isLoading} 
          style={{ width: '100%', marginTop: '1.5rem', height: '3rem', fontSize: '1rem', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#1E2F85', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  )
}


