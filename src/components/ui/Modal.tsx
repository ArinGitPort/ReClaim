import React, { useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string; // e.g. max-w-xl
  closeOnOutsideClick?: boolean;
}

export function Modal({ isOpen, onClose, children, className, closeOnOutsideClick = true }: ModalProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4">
      <div
        className="fixed inset-0 bg-slate-900/80 transition-opacity"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />
      <div className={cn(
        "relative w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200",
        className
      )}>
        {children}
      </div>
    </div>,
    document.body
  )
}
