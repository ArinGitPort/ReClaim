import { useEffect, useRef } from "react"

export function useGlobalScanner(onScan: (scannedText: string) => void) {
  const bufferRef = useRef<string>("")
  const lastKeyTimeRef = useRef<number>(0)
  const onScanRef = useRef(onScan)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])
  
  // Hardware scanners simulate typing very fast. Normal human typing is slower.
  // 150ms is a safer threshold for cheaper barcode scanners that may have USB HID jitter.
  const SCANNER_SPEED_THRESHOLD_MS = 150

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses if the user is typing into an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const currentTime = new Date().getTime()
      
      // If it's been a while since the last key, reset the buffer
      if (currentTime - lastKeyTimeRef.current > SCANNER_SPEED_THRESHOLD_MS) {
        bufferRef.current = ""
      }

      lastKeyTimeRef.current = currentTime

      // A hardware scanner usually ends with an 'Enter' key press
      if (e.key === "Enter") {
        if (bufferRef.current.length > 0) {
          e.preventDefault()
          e.stopPropagation()
          onScanRef.current(bufferRef.current)
          bufferRef.current = ""
        }
        return
      }

      // Capture printable characters only
      if (e.key.length === 1) {
        bufferRef.current += e.key
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true })
    }
  }, [])
}
