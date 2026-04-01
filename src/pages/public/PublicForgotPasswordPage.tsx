import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm"
import { ShieldCheck, MailCheck, KeyRound } from "lucide-react"

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex w-full max-h-screen overflow-hidden">
      {/* Left Column - Informational Background */}
      <div className="hidden lg:flex w-1/2 bg-brand text-white relative flex-col justify-center px-12 xl:px-24 border-r border-[#1E2F85] overflow-hidden">
        
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        {/* Decorative blurry blobs matching brand theme */}
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-left-8 duration-700 max-w-lg">
          
          <div className="flex gap-4 mb-2">
            <div className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <ShieldCheck className="w-7 h-7 text-indigo-100" />
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl -translate-y-4">
              <KeyRound className="w-6 h-6 text-cyan-200" />
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl -translate-y-1">
              <MailCheck className="w-7 h-7 text-indigo-100" />
            </div>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Don't worry <br/>
            <span className="text-indigo-200">it happens!</span>
          </h1>
          
          <div className="space-y-6 text-base xl:text-lg text-indigo-100/90 leading-relaxed">
            <p>
              Resetting your password is quick and easy. Just enter your registered email address below, and we'll send you a secure link to reset your password.
            </p>
            <p>
              Follow the instructions in the email, and you'll be back in your account in no time!
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-slate-50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-100/50 -z-10" />
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
