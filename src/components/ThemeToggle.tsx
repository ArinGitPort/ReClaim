import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
        ${isDark ? "bg-brand" : "bg-border-divider/70"}
      `}
      aria-label="Toggle Dark Mode"
    >
      <span
        className={`
          absolute w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out flex items-center justify-center
          ${isDark ? "translate-x-9" : "translate-x-1"}
        `}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-brand" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-text-secondary" />
        )}
      </span>
    </button>
  )
}
