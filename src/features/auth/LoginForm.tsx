import React, { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ShieldCheck, User, Lock } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder for actual login logic
    console.log("Logging in...", { email, password })
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

        <Button type="submit" className="w-full mt-6 h-12 text-base font-semibold shadow hover:shadow-md transition-shadow text-white">
          Sign In
        </Button>
      </form>
    </div>
  )
}
