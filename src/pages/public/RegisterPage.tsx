import { RegisterForm } from "@/features/auth/RegisterForm"
import { TopNavBar } from "@/layouts/TopNavBar"

export function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '4rem' }}>
      <TopNavBar title="Account Registration" backLabel="Back to Login" backLink="/" />

      {/* Main Registration Area */}
      <div style={{ width: '100%', maxWidth: '48rem', margin: '4rem auto', padding: '3rem' }}>
        
        {/* Core University Branding / Title Heading */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(241, 245, 249, 0.8)', paddingBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0F172A', marginBottom: '0.5rem', margin: 0 }}>
            Registration Form
          </h1>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: '#64748B', margin: 0 }}>Lost & Found Registration</p>
        </div>

        {/* The Two-Column Form */}
        <div style={{ width: '100%' }}>
          <RegisterForm />
        </div>

      </div>
    </div>
  )
}
