import { RegisterForm } from "@/features/auth/RegisterForm"
import { TopNavBar } from "@/layouts/TopNavBar"

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-background-subtle font-sans pb-16">
      <TopNavBar title="Account Registration" backLabel="Back to Login" backLink="/" />

      {/* Main Registration Area */}
      <div className="w-full max-w-3xl mx-auto my-10 sm:my-16 p-8 sm:p-12">
        
        {/* Core University Branding / Title Heading */}
        <div className="mb-10 border-b border-border-divider/80 pb-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary mb-2">
            Registration Form
          </h1>
          <p className="text-base font-medium text-text-secondary">Lost & Found Registration</p>
        </div>

        {/* The Two-Column Form */}
        <div className="w-full">
          <RegisterForm />
        </div>

      </div>
    </div>
  )
}
