const fs = require('fs');

function fixReport() {
  let c = fs.readFileSync('src/features/reports/ReportConfirmationModal.tsx', 'utf8');
  const headEnd = c.indexOf('  else {');
  const buttonStart = c.indexOf('onClick={onClose}\n          className="absolute right-6');
  if (headEnd > -1 && buttonStart > -1) {
    let newC = c.slice(0, headEnd) + `  useEffect(() => {\n    if (isOpen) {\n      setRefNumber("REP-" + Math.random().toString(36).substring(2, 8).toUpperCase())\n    }\n  }, [isOpen])\n\n  if (!isOpen) return null;\n\n  return (\n    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 text-center my-auto relative border border-slate-100">\n      <button\n          ` + c.slice(buttonStart);
    newC = newC.replace(/<\/div>\r?\n    <\/div>\r?\n  \)\r?\n}$/, '    </Modal>\n  )\n}');
    fs.writeFileSync('src/features/reports/ReportConfirmationModal.tsx', newC);
  }
}

function fixDeny() {
  let c = fs.readFileSync('src/features/claims/DenyClaimModal.tsx', 'utf8');
  let tIdx = c.indexOf('{/* Header */}');
  if (tIdx > -1) {
    c = `import { Modal } from "@/components/ui/Modal"
import { useEffect } from "react"
import { X, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface DenyClaimModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  denyReason: string
  setDenyReason: (reason: string) => void
}

export function DenyClaimModal({
  isOpen,
  onClose,
  onConfirm,
  denyReason,
  setDenyReason
}: DenyClaimModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        ` + c.slice(tIdx).replace(/<\/div>\r?\n    <\/div>\r?\n  \)\r?\n}$/, '    </Modal>\n  )\n}');
    fs.writeFileSync('src/features/claims/DenyClaimModal.tsx', c);
  }
}

function fixClaimThis() {
  let c = fs.readFileSync('src/features/claims/ClaimThisItemModal.tsx', 'utf8');
  let tIdx = c.indexOf('{/* Modal Wrapper */}');
  if (tIdx > -1 || true) {
     c = c.replace(/<div className="fixed inset-0 z-100[^\>]*>[\s\S]*?<div className="fixed inset-0 bg-slate-900\/80" onClick=\{onClose\} \/>\s*<div className="relative w-full ([^\"]+)"[^>]*>/, '<Modal isOpen={isOpen} onClose={onClose} className="$1">');
     c = c.replace(/<\/div>\r?\n    <\/div>\r?\n  \)\r?\n}$/, '    </Modal>\n  )\n}');
     fs.writeFileSync('src/features/claims/ClaimThisItemModal.tsx', c);
  }
}
fixReport();
fixDeny();
fixClaimThis();
console.log("All fixed!");