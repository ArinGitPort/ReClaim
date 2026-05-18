import { Modal } from "@/components/ui/Modal"
import { MatchLinkingModal } from "@/features/admin/modals"
import type { ReportRow } from "./types"

type MissingReportLinkModalProps = {
  isOpen: boolean
  report: ReportRow | undefined
  selectedReportId: string | null
  onClose: () => void
  onLinked: (reportId: string) => void
}

export function MissingReportLinkModal({ isOpen, report, selectedReportId, onClose, onLinked }: MissingReportLinkModalProps) {
  return (
    <Modal
      isOpen={isOpen && Boolean(selectedReportId)}
      onClose={onClose}
      className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
    >
      {selectedReportId && (
        <MatchLinkingModal
          reportId={report?.id || selectedReportId}
          reportCode={report?.code || ""}
          itemTitle={report?.item || "Item"}
          onLinked={() => onLinked(selectedReportId)}
          prefill={report ? {
            category: report.category,
            color: report.color,
            dateFrom: report.reportedLostAtUtcRaw,
          } : undefined}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
