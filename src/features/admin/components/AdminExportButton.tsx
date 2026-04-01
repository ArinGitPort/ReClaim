import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AdminExportButtonProps = {
  label?: string
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function AdminExportButton({
  label = "Export",
  disabled,
  onClick,
  className,
}: AdminExportButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn("h-10 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl", className)}
    >
      <Download className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )
}
