import { ClipboardList, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export type DashboardView = "operations" | "overview"

type DashboardViewToggleProps = {
  value: DashboardView
  onChange: (value: DashboardView) => void
}

const views = [
  { value: "operations", label: "Operations", icon: ClipboardList },
  { value: "overview", label: "Overview", icon: LayoutDashboard },
] as const

export function DashboardViewToggle({ value, onChange }: DashboardViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {views.map((view) => {
        const Icon = view.icon
        const isActive = value === view.value

        return (
          <button
            key={view.value}
            type="button"
            onClick={() => onChange(view.value)}
            className={cn(
              "h-9 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              isActive
                ? "bg-brand text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
            )}
          >
            <Icon className="w-4 h-4" />
            {view.label}
          </button>
        )
      })}
    </div>
  )
}
