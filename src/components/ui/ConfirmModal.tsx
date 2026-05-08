import { AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "./button"
import { Modal } from "./Modal"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-8 sm:p-10 text-center my-auto animate-in zoom-in-95 duration-200">
      <button
        onClick={onClose}
        disabled={isLoading}
        className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ${isDestructive ? 'bg-rose-100' : 'bg-brand/10'}`}>
        {isDestructive ? (
          <AlertCircle className="w-8 h-8 text-rose-600" />
        ) : (
          <CheckCircle className="w-8 h-8 text-brand" />
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3 leading-none uppercase">{title}</h1>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
        {message}
      </p>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onClick={onClose} 
          disabled={isLoading} 
          className="flex-1 h-12 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 h-12 font-black text-white shadow-sm transition-all active:scale-95 rounded-xl ${isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand hover:bg-brand-active'}`}
        >
          {isLoading ? "Processing..." : confirmText}
        </Button>
      </div>
    </Modal>
  )
}
