import type { ReactNode } from "react"
import { Activity, Database, Filter, X } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { formatDateTime } from "@/lib/formatters"
import { AuditNarrative } from "./AuditNarrative"
import { AuditPayloadPanel } from "./AuditPayloadPanel"
import { toRecordLabel } from "./auditLogUtils"
import type { AuditLogRow } from "./types"

type AuditLogDetailsModalProps = {
  log: AuditLogRow | null
  onClose: () => void
}

export function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
  return (
    <Modal
      isOpen={Boolean(log)}
      onClose={onClose}
      className="w-full flex flex-col max-w-3xl overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl p-0 max-h-[90vh]"
    >
      {log && (
        <>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-brand uppercase tracking-tight">Activity Details</h2>
                <p className="font-mono mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{log.id}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            <ModalSection icon={<Activity className="w-3.5 h-3.5 text-brand" />} title="Context & Actor">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 rounded-xl bg-slate-50/50 p-5 border border-slate-100">
                <InfoRow label="Date & Time" value={formatDateTime(log.createdAt)} />
                <InfoRow label="User" value={log.actorUser.name} />
                <InfoRow label="Role" value={log.actorUser.role} />
                <InfoRow label="Email" value={log.actorUser.email} />
                <InfoRow label="Record Target" value={`${toRecordLabel(log.targetType)} (${log.targetReferenceCode})`} />
              </div>
            </ModalSection>

            <ModalSection icon={<Filter className="w-3.5 h-3.5 text-brand" />} title="Audited Action">
              <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand" />
                <p className="text-sm font-semibold text-slate-800 leading-relaxed ml-2">
                  <AuditNarrative log={log} />
                </p>
                {log.description && (
                  <p className="mt-3 ml-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    {log.description}
                  </p>
                )}
              </div>
            </ModalSection>

            <ModalSection icon={<Database className="w-3.5 h-3.5 text-brand" />} title="Payload Data">
              <AuditPayloadPanel payload={log.payload} />
            </ModalSection>
          </div>
        </>
      )}
    </Modal>
  )
}

function ModalSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
        {icon}
        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={mono ? "mt-1 text-sm font-bold text-slate-700 font-mono" : "mt-1 text-sm font-semibold text-slate-700"}>{value}</div>
    </div>
  )
}
