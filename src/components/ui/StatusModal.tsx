import { X } from "lucide-react"
import { Modal } from "./Modal"
import { StatusContent } from "./StatusContent"
import type { StatusContentProps } from "./StatusContent"

interface StatusModalProps extends StatusContentProps {
  isOpen: boolean
  onClose: () => void
}

export function StatusModal({
  isOpen,
  onClose,
  ...contentProps
}: StatusModalProps) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <StatusContent {...contentProps} />
    </Modal>
  )
}
