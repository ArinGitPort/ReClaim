import React, { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Mail, Phone, Lock, Hash, User, AlertCircle } from "lucide-react"
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
    <div style={{ width: '100%', paddingBottom: '2.5rem' }}>
      {error && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(225, 29, 72, 0.1)', 
          border: '1px solid rgba(225, 29, 72, 0.3)', 
          borderRadius: '0.75rem', 
          display: 'flex', 
          alignItems: 'start', 
          gap: '0.75rem', 
          color: '#E11D48', 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.25', margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* SECTION 1: Campus Identity */}
        <div>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            color: '#64748B', 
            marginBottom: '1.25rem', 
            paddingBottom: '0.5rem', 
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            margin: 0
          }}>
            1. Campus Identity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
                Student / Staff ID Number
              </label>
              <div style={{ position: 'relative' }}>
                <Hash style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#64748B', zIndex: 1 }} />
                <Input
                  type="text"
                  placeholder="2020-123456"
                  value={studentId}
                  onChange={handleIdChange}
                  style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
                Institutional Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#64748B', zIndex: 1 }} />
                <Input
                  type="email"
                  placeholder="juan.delacruz@students.nu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Personal Details */}
        <div>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            color: '#64748B', 
            marginBottom: '1.25rem', 
            paddingBottom: '0.5rem', 
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            margin: 0
          }}>
            2. Personal Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
                First Name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#64748B', zIndex: 1 }} />
                <Input
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
                Last Name
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ paddingLeft: '1rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', gridColumn: 'span 2', maxWidth: '20rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
                Middle Initial <span style={{ color: '#64748B', fontWeight: 'normal' }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  maxLength={2}
                  placeholder="M."
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  style={{ paddingLeft: '1rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Logistics */}
        <div>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            color: '#64748B', 
            marginBottom: '1.25rem', 
            paddingBottom: '0.5rem', 
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            margin: 0
          }}>
            3. Logistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
                Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#64748B', zIndex: 1 }} />
                <Input
                  type="tel"
                  placeholder="09XX-XXX-XXXX"
                  value={mobile}
                  onChange={handleMobileChange}
                  style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Security */}
        <div>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            color: '#64748B', 
            marginBottom: '1.25rem', 
            paddingBottom: '0.5rem', 
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            margin: 0
          }}>
            4. Security
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
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
                  style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', marginLeft: '0.25rem', display: 'block' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#64748B', zIndex: 1 }} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.75rem', height: '3rem', backgroundColor: '#FFFFFF', fontSize: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            style={{ width: 'auto', paddingLeft: '3rem', paddingRight: '3rem', height: '3rem', fontSize: '1rem', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#1E2F85', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          >
            {isSubmitting ? "Creating Account..." : "Complete Registration"}
          </Button>
        </div>
      </form>

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748B', paddingBottom: '1rem' }}>
        <p>Already have an account? <Link to="/" style={{ color: '#1E2F85', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link></p>
      </div>
    </div>
  )
}

