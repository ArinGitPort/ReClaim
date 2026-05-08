import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "@/lib/validations/authSchemas"

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)

    try {
      await login(data.email, data.password)

      const me = await api.get<{ user: { role: "ADMIN" | "STAFF" | "STUDENT" } }>("/auth/me")
      if (me.data.user.role === "ADMIN" || me.data.user.role === "STAFF") {
        navigate("/admin/dashboard")
      } else {
        navigate("/gallery")
      }
    } catch {
      setSubmitError("Login failed. Check your credentials and try again.")
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 relative">
          <label className="text-sm font-semibold text-text-primary ml-1 block">
            Email Address
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
            <Input
              type="email"
              placeholder="admin@campus.edu"
              {...register("email", {
                setValueAs: (value: string) => value.replace(/\s/g, ""),
              })}
              className="pl-11 h-12 bg-background-subtle focus:bg-background-app text-base transition-colors border-border-divider/50"
              aria-invalid={Boolean(errors.email)}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-600 font-semibold">{errors.email.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <label className="text-sm font-semibold text-text-primary ml-1 block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password", {
                setValueAs: (value: string) => value.replace(/\s/g, ""),
              })}
              className="pl-11 pr-11 h-12 bg-background-subtle focus:bg-background-app text-base transition-colors border-border-divider/50"
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-600 font-semibold">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-sm mt-4">
          <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary transition-colors font-medium">
            <input type="checkbox" className="rounded border-border-divider text-brand focus:ring-brand w-4 h-4 bg-background-subtle" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-brand hover:text-brand-active font-semibold transition-colors">
            Forgot Password?
          </Link>
        </div>

        {submitError && <p className="text-sm text-rose-600 font-semibold">{submitError}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full mt-6 h-12 text-base font-semibold shadow hover:shadow-md transition-shadow text-white">
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  )
}


