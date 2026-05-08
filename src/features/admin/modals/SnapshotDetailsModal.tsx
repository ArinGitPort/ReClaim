import { useState } from "react"
import { Camera, MapPin, Clock, Check, Trash2 } from "lucide-react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { getImageUrl } from "@/lib/utils"

type AISnapshot = {
  id: string
  sourceCameraId: string
  snapshotPath: string
  detectedAtUtc: string
  detectionMeta: {
    category?: string
    confidence?: number
    location?: string
  }
}

interface SnapshotDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  snapshot: AISnapshot | null
  onDismiss: (id: string) => Promise<void>
  onLogFound: (snapshot: AISnapshot) => Promise<void>
}

export function SnapshotDetailsModal({ isOpen, onClose, snapshot, onDismiss, onLogFound }: SnapshotDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDismissConfirmOpen, setIsDismissConfirmOpen] = useState(false)

  if (!snapshot) return null

  const meta = snapshot.detectionMeta || {}
  const confidence = Math.round((meta.confidence || 0) * 100)
  
  const badgeColor = confidence >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
                     confidence >= 75 ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                     'bg-amber-50 text-amber-700 border-amber-200'

  const handleDismiss = async () => {
    setIsProcessing(true)
    try {
      await onDismiss(snapshot.id)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmDismiss = async () => {
    setIsDismissConfirmOpen(false)
    await handleDismiss()
  }

  const handleLogFound = async () => {
    setIsProcessing(true)
    try {
      await onLogFound(snapshot)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl flex flex-col max-h-[90vh]">
      <ModalHeader
        title="AI Snapshot Review"
        icon={<Camera className="w-5 h-5 text-white" />}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Large Image Preview */}
        <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative min-h-75 shadow-inner">
          {snapshot.snapshotPath ? (
            <img 
              src={getImageUrl(snapshot.snapshotPath)}
              alt="Snapshot" 
              className="w-full h-auto max-h-125 object-contain" 
            />
          ) : (
            <div className="text-slate-600 flex flex-col items-center">
              <Camera className="w-12 h-12 mb-3 opacity-50" />
              <span className="text-sm font-bold uppercase tracking-widest">Image Unavailable</span>
            </div>
          )}
          
          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg shadow-sm text-xs font-extrabold uppercase tracking-widest border ${badgeColor}`}>
            {confidence}% Match
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Detected Object</p>
            <p className="text-lg font-bold text-slate-900 capitalize">{meta.category || "Unknown Object"}</p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Time Logged</p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Clock className="w-4 h-4 text-brand" />
              {new Date(snapshot.detectedAtUtc).toLocaleString()}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Location / Camera</p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-brand" />
              {meta.location || snapshot.sourceCameraId}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <Button
          type="button"
          onClick={() => setIsDismissConfirmOpen(true)}
          disabled={isProcessing}
          className="flex-1 h-12 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600 font-bold rounded-xl uppercase tracking-widest text-xs shadow-sm transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Dismiss False Alarm
        </Button>
        <Button
          type="button"
          onClick={handleLogFound}
          disabled={isProcessing}
          className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl uppercase tracking-widest text-xs shadow-sm"
        >
          <Check className="w-4 h-4 mr-2" />
          Log as Found Item
        </Button>
      </div>

      <ConfirmModal
        isOpen={isDismissConfirmOpen}
        onClose={() => !isProcessing && setIsDismissConfirmOpen(false)}
        onConfirm={() => void handleConfirmDismiss()}
        title="Dismiss Snapshot"
        message="Dismiss this AI snapshot as a false alarm? This removes it from the review queue."
        confirmText="Dismiss"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isProcessing}
      />
    </Modal>
  )
}
