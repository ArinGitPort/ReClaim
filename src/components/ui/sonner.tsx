import { Toaster as SonnerToaster, type ToasterProps } from "sonner"
import { useTheme } from "@/contexts/ThemeProvider"

export function Toaster(props: ToasterProps) {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg",
          title: "text-sm font-bold",
          description: "text-xs font-semibold text-slate-500",
          actionButton: "bg-brand text-white",
          cancelButton: "bg-slate-100 text-slate-700",
          closeButton: "border-slate-200 bg-white text-slate-500",
        },
      }}
      {...props}
    />
  )
}
