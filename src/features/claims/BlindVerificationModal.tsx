import { X, ShieldAlert, CheckCircle2 } from "lucide-react"

interface BlindVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
}

export function BlindVerificationModal({ isOpen, onClose, itemId, itemTitle }: BlindVerificationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-background-app rounded-2xl shadow-2xl border border-border-divider overflow-hidden animate-in fade-in zoom-in-95 duration-200" data-item-id={itemId}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-divider/50 flex items-start justify-between bg-background-subtle">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Claim Verification</h2>
            <p className="text-sm text-text-secondary mt-1">
              Provide hidden details to prove ownership of <span className="font-semibold text-text-primary">{itemTitle}</span>.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-border-divider/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-6">
          <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 flex gap-3 text-brand/80">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              <strong>Blind Verification is active.</strong> High-value items require specific, non-public identifiers. If this is a digital device, please describe the lock screen wallpaper or provide the MAC address.
            </p>
          </div>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* 1. The Must-Have Identifiers */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">1. Device Identifiers</h3>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text-primary block ml-1">
                  Device Name / Username <span className="text-status-error">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g., John's MacBook Pro"
                  className="w-full h-11 px-3.5 text-sm bg-background-subtle border border-border-divider/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary placeholder:text-text-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text-primary block ml-1">
                  Lock Screen Wallpaper <span className="text-status-error">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="Describe the image on the lock screen"
                  className="w-full h-11 px-3.5 text-sm bg-background-subtle border border-border-divider/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary placeholder:text-text-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text-primary block ml-1">
                  Serial Number / MAC Address <span className="text-text-secondary font-normal">(Optional)</span>
                </label>
                <input 
                  type="text"
                  placeholder="Enter if known"
                  className="w-full h-11 px-3.5 text-sm bg-background-subtle border border-border-divider/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary placeholder:text-text-secondary"
                />
              </div>
            </div>

            {/* 2. Physical Identifiers */}
            <div className="space-y-4 pt-3 border-t border-border-divider/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">2. Physical Identifiers</h3>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text-primary block ml-1">
                  External Case / Color <span className="text-status-error">*</span>
                </label>
                <select className="w-full h-11 px-3.5 text-sm bg-background-subtle border border-border-divider/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary cursor-pointer">
                  <option value="" disabled selected>Select primary color</option>
                  <option value="space-gray">Space Gray / Dark Gray</option>
                  <option value="silver">Silver / Light Gray</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="other">Other / Has Hard Shell Case</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text-primary block ml-1">
                  Distinctive Features <span className="text-text-secondary font-normal">(Optional)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="Specific stickers, scratches, or dents"
                  className="w-full p-3.5 text-sm bg-background-subtle border border-border-divider/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary resize-none placeholder:text-text-secondary"
                />
              </div>
            </div>

            {/* 3. Logistics */}
            <div className="space-y-4 pt-3 border-t border-border-divider/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">3. User Logistics</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-text-primary block ml-1 truncate">
                    Student / Staff ID <span className="text-status-error">*</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="2020-XXXXXX"
                    className="w-full h-11 px-3.5 text-sm bg-background-subtle border border-border-divider/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary placeholder:text-text-secondary"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-text-primary block ml-1 truncate">
                    Contact Phone <span className="text-status-error">*</span>
                  </label>
                  <input 
                    type="tel"
                    placeholder="09XX-XXX-XXXX"
                    className="w-full h-11 px-3.5 text-sm bg-background-subtle border border-border-divider/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-background-app transition-colors text-text-primary placeholder:text-text-secondary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 bg-background-subtle border-t border-border-divider/50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-border-divider/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2.5 bg-brand hover:opacity-90 transition-opacity text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Claim Request
          </button>
        </div>

      </div>
    </div>
  )
}
