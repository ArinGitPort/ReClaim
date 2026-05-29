import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { useGlobalScanner } from "@/hooks/useGlobalScanner"
import { Modal } from "@/components/ui/Modal"
import { InventoryHandoverModal } from "@/features/admin/modals"
import { toast } from "sonner"

type HardwareScannerContextType = {
  isScanningEnabled: boolean
  setIsScanningEnabled: (enabled: boolean) => void
}

const HardwareScannerContext = createContext<HardwareScannerContextType | undefined>(undefined)

export function HardwareScannerProvider({ children }: { children: ReactNode }) {
  const [isScanningEnabled, setIsScanningEnabled] = useState(true)
  const [scannedToken, setScannedToken] = useState<string | null>(null)

  // Listen to the scanner globally
  useGlobalScanner((text) => {
    if (!isScanningEnabled) return

    // Quick sanitization
    const token = text.trim().toUpperCase()
    
    // We expect pickup tokens to start with PK- and be 9 characters long
    if (token.startsWith("PK-") && token.length === 9) {
      setScannedToken(token)
    } else {
      // If we scan something else, just show a minor toast
      toast.error(`Invalid token scanned: ${text}`)
    }
  })

  function handleCloseModal() {
    setScannedToken(null)
  }

  return (
    <HardwareScannerContext.Provider value={{ isScanningEnabled, setIsScanningEnabled }}>
      {children}
      
      {/* Global Handover Modal triggered by scan */}
      <Modal
        isOpen={Boolean(scannedToken)}
        onClose={handleCloseModal}
        className="w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        {scannedToken && (
          <InventoryHandoverModal
            initialToken={scannedToken}
            onClose={handleCloseModal}
            onCompleted={() => {
              // Optionally trigger a global refresh or toast
              toast.success("Handover successful!")
            }}
          />
        )}
      </Modal>
    </HardwareScannerContext.Provider>
  )
}

export function useHardwareScanner() {
  const context = useContext(HardwareScannerContext)
  if (context === undefined) {
    throw new Error("useHardwareScanner must be used within a HardwareScannerProvider")
  }
  return context
}
