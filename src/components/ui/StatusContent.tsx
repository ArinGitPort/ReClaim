import type { ReactNode } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"

export interface StatusContentProps {
  title: string
  message?: string
  icon?: "success" | "error" | "warning" | ReactNode
  children?: ReactNode
  actions?: ReactNode
  bottomText?: ReactNode
}

export function StatusContent({
  title,
  message,
  icon = "success",
  children,
  actions,
  bottomText
}: StatusContentProps) {
  const renderIcon = () => {
    if (typeof icon !== "string") return icon
    
    if (icon === "success") {
      return (
        <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle className="w-8 h-8 text-brand" />
        </div>
      )
    }
    
    if (icon === "error" || icon === "warning") {
      return (
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
      )
    }

    return null
  }

  return (
    <div className="text-center p-8 sm:p-10 w-full h-full flex flex-col justify-center">
      {renderIcon()}

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3 leading-none uppercase">
        {title}
      </h1>
      
      {message && (
        <p className={`text-slate-500 text-sm leading-relaxed font-medium ${children || actions ? 'mb-8' : ''}`}>
          {message}
        </p>
      )}

      {children && (
        <div className={`text-left ${actions ? 'mb-8' : ''}`}>
          {children}
        </div>
      )}

      {actions && (
        <div>
          {actions}
        </div>
      )}

      {bottomText && (
        <div className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          {bottomText}
        </div>
      )}
    </div>
  )
}
