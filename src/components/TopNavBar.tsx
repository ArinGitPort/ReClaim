import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { ThemeToggle } from "@/components/ThemeToggle"

interface TopNavBarProps {
  title?: string
  backLink?: string
  backLabel?: string
}

export function TopNavBar({ 
  title = "Campus Lost & Found", 
  backLink = "/", 
  backLabel = "Back" 
}: TopNavBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={backLink} className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden md:block">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
