import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleBtnStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    height: '2rem',
    width: '4rem',
    alignItems: 'center',
    borderRadius: '9999px',
    transition: 'background-color 0.3s ease',
    backgroundColor: isDark ? '#1E2F85' : 'rgba(226, 232, 240, 0.7)',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
  }

  const knobStyles: React.CSSProperties = {
    position: 'absolute',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '9999px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: isDark ? 'translateX(2.25rem)' : 'translateX(0.25rem)',
  }

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={toggleBtnStyles}
      aria-label="Toggle Dark Mode"
    >
      <span style={knobStyles}>
        {isDark ? (
          <Moon style={{ height: '0.875rem', width: '0.875rem', color: '#1E2F85' }} />
        ) : (
          <Sun style={{ height: '0.875rem', width: '0.875rem', color: '#64748B' }} />
        )}
      </span>
    </button>
  )
}
