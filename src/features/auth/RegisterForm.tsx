import React, { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Lock, Hash, User, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  // Form State
  const [studentId, setStudentId] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [middleInitial, setMiddleInitial] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Validation State
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    // 1. Student ID Validation (YYYY-XXXXXX)
    const idRegex = /^\d{4}-\d{6}$/
    if (!idRegex.test(studentId)) {
      return "Student ID must follow the format YYYY-XXXXXX (e.g., 2020-123456)"
    }

    // 2. Email Domain Validation
    const allowedDomains = ["@national-u.edu.ph", "@students.nu.edu.ph"]
    const hasValidDomain = allowedDomains.some(domain => email.endsWith(domain))
    if (!hasValidDomain) {
      return "Registration is strictly limited to @national-u.edu.ph or @students.nu.edu.ph emails."
    }

    // 3. Mobile Number Validation (09XX-XXX-XXXX)
    // Accept formats like 0912-345-6789 or 09123456789 and normalize it
    const mobileRegex = /^09\d{2}-?\d{3}-?\d{4}$/
    if (!mobileRegex.test(mobile)) {
      return "Mobile number must be a valid Philippine number starting with 09 (e.g., 09XX-XXX-XXXX)"
    }

    // 4. Password Match
    if (password !== confirmPassword) {
      return "Passwords do not match."
    }
    
    if (password.length < 8) {
      return "Password must be at least 8 characters long."
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const fullName = [firstName, middleInitial, lastName].filter(Boolean).join(" ")

    setIsSubmitting(true)
    try {
      await register({
        name: fullName,
        email,
        password,
        studentId,
      })

      navigate("/gallery")
    } catch (err: any) {
      if (!err.response) {
        setError("Network error: Backend server is unreachable. Please ensure the backend is running on port 4000.")
      } else if (err.response.status === 409) {
        setError("Registration failed: This email is already registered.")
      } else {
        setError(err.response?.data?.error || "Registration failed. Please check your information and try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format mobile number as user types (09XX-XXX-XXXX)
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    
    // Attempt basic formatting if enough digits exist
    if (val.length > 4 && val.length <= 7) {
      val = `${val.slice(0, 4)}-${val.slice(4)}`
    } else if (val.length > 7) {
      val = `${val.slice(0, 4)}-${val.slice(4, 7)}-${val.slice(7)}`
    }
    setMobile(val)
  }

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 10) val = val.slice(0, 10)
    
    if (val.length > 4) {
      val = `${val.slice(0, 4)}-${val.slice(4)}`
    }
    setStudentId(val)
  }

  return (
    <div className="w-full pb-10">
      {error && (
        <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-xl flex items-start gap-3 text-status-error shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-tight">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION 1: Campus Identity */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-5 pb-2 border-b border-border-divider/80">1. Campus Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Student / Staff ID Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <Input
                  type="text"
                  placeholder="2020-123456"
                  value={studentId}
                  onChange={handleIdChange}
                  className="pl-11 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <Input
                  type="email"
                  placeholder="juan.delacruz@students.nu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                  className="pl-11 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Personal Details */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-5 pb-2 border-b border-border-divider/80">2. Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <Input
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-11 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Last Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="px-4 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2 relative md:col-span-2 max-w-xs">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Middle Initial <span className="text-text-secondary font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  maxLength={2}
                  placeholder="M."
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  className="px-4 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Logistics */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-5 pb-2 border-b border-border-divider/80">3. Logistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <Input
                  type="tel"
                  placeholder="09XX-XXX-XXXX"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="pl-11 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Security */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-5 pb-2 border-b border-border-divider/80">4. Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                  className="pl-11 pr-11 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ""))}
                  className="pl-11 pr-11 h-12 bg-background-app focus:bg-background-app text-base transition-colors border-border-divider/50 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 pb-2 flex justify-center">
          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto md:px-12 h-12 text-base font-semibold shadow-sm transition-shadow text-white rounded-lg">
            {isSubmitting ? "Creating Account..." : "Complete Registration"}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-text-secondary pb-4">
        <p>Already have an account? <Link to="/" className="text-brand font-semibold hover:underline transition-all">Sign In</Link></p>
      </div>
    </div>
  )
}

