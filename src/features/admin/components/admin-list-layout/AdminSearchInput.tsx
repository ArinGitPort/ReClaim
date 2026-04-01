import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"

type AdminSearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function AdminSearchInput({ value, onChange, placeholder }: AdminSearchInputProps) {
  return (
    <div className="relative flex-1 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-12 h-12 bg-white border-slate-200 shadow-sm focus:ring-brand/10 text-sm font-medium rounded-xl"
      />
    </div>
  )
}
