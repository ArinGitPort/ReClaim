import { Bell, CheckCircle, Info, X } from "lucide-react"
import { Button } from "./button"
import { Modal } from "./Modal"

interface NoticeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
  variant?: "success" | "info" | "alert"
}

export function NoticeModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Acknowledge",
  variant = "success",
}: NoticeModalProps) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
          bg: "bg-emerald-100",
          button: "bg-emerald-600 hover:bg-emerald-700",
        }
      case "info":
        return {
          icon: <Info className="w-8 h-8 text-blue-600" />,
          bg: "bg-blue-100",
          button: "bg-blue-600 hover:bg-blue-700",
        }
      case "alert":
        return {
          icon: <Bell className="w-8 h-8 text-amber-600" />,
          bg: "bg-amber-100",
          button: "bg-amber-600 hover:bg-amber-700",
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-8 sm:p-10 text-center my-auto animate-in zoom-in-95 duration-200">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ${styles.bg}`}>
        {styles.icon}
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3 leading-none uppercase">{title}</h1>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
        {message}
      </p>

      <Button
        onClick={onClose}
        className={`w-full h-12 font-black text-white shadow-sm transition-all active:scale-95 rounded-xl ${styles.button}`}
      >
        {buttonText}
      </Button>
    </Modal>
  )
}
