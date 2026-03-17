import { X, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useEffect } from "react"

interface ClaimVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
}

export function ClaimVerificationModal({ isOpen, onClose, itemId, itemTitle }: ClaimVerificationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4">
      {/* Backdrop - Clean, no blur */}
      <div
        className="fixed inset-0 bg-slate-900/80"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200" data-item-id={itemId}>

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">Claim Verification</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-8 space-y-8">
          <div className="bg-brand/[0.03] border border-brand/10 rounded-xl p-5 flex gap-4 text-slate-600">
            <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <p className="text-[13px] leading-relaxed font-medium">
              <strong>Blind Verification Active.</strong> High-value items require specific, non-public identifiers. Describe the device properties or distinctive marks to prove ownership of <span className="text-slate-900 font-bold">{itemTitle}</span>.
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Device Identifiers */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">1. Device Identifiers</h3>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  Device Name / Username <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., John's MacBook Pro"
                  className="w-full h-12 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  Lock Screen Wallpaper <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Describe the image on the lock screen"
                  className="w-full h-12 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  Serial Number / MAC Address <span className="text-slate-400 font-medium">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter if known"
                  className="w-full h-12 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                />
              </div>
            </div>

            {/* 2. Physical Identifiers */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">2. Physical Identifiers</h3>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  External Case / Color <span className="text-rose-500 font-black">*</span>
                </label>
                <select className="w-full h-12 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all text-slate-900 cursor-pointer font-medium">
                  <option value="" disabled selected>Select primary color</option>
                  <option value="space-gray">Space Gray / Dark Gray</option>
                  <option value="silver">Silver / Light Gray</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="other">Other / Has Hard Shell Case</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                   Distinctive Features <span className="text-slate-400 font-medium">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific stickers, stickers, or notable scratches..."
                  className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all text-slate-900 resize-none placeholder:text-slate-400 font-medium shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            className="flex-1 h-12 bg-brand hover:bg-brand-active transition-all text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 shadow-sm uppercase tracking-widest"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Request
          </button>
        </div>

      </div>
    </div>
  )
}
