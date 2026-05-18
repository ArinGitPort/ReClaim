import { Cpu, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"

type StartAiServiceConfirmModalProps = {
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function StartAiServiceConfirmModal({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: StartAiServiceConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-0 overflow-hidden">
      <ModalHeader
        title="Start AI Service"
        icon={<Cpu className="w-5 h-5 text-white" />}
        onClose={onClose}
      />

      <div className="p-6 space-y-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">You are about to start live AI monitoring</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
                This launches the Python AI daemon, opens configured camera streams, and may use your GPU or CPU for YOLO inference.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-xs font-semibold text-slate-600">
          <p>Only cameras with AI Detection enabled will run abandoned-item analysis.</p>
          <p>Cameras with AI Detection disabled can still be viewed as raw feeds while the service is online.</p>
          <p>You can stop the AI service anytime from Live Monitor to release compute resources.</p>
        </div>
      </div>

      <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 p-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 h-12 border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 h-12 bg-brand text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-active"
        >
          {isLoading ? "Starting..." : "Yes, Start AI Service"}
        </Button>
      </div>
    </Modal>
  )
}
