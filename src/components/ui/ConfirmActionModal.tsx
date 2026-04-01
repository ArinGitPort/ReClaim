import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"

type ConfirmActionModalProps = {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md" closeOnOutsideClick={!isLoading}>
      <div className="px-6 py-5 border-b border-slate-100 bg-rose-50/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
            {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="h-10 px-5 font-bold">
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isLoading}
          className="h-10 px-5 font-bold"
        >
          {isLoading ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
