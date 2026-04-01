import React, { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, Send } from "lucide-react"
import { Link } from "react-router-dom"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter your registered email address.")
      return
    }

    setError(null)
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Enter your email to receive reset instructions
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm space-y-2 leading-relaxed">
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p>
              Please check your inbox and spam folder.
            </p>
          </div>
          <Link to="/" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                placeholder="e.g. student@school.edu"
                className="pl-10 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-brand hover:bg-navy text-white h-12 text-base font-medium rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending link...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Send Reset Link <Send className="w-4 h-4" />
              </span>
            )}
          </Button>

          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-slate-500 hover:text-brand transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
