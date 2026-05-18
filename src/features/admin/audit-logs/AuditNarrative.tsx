import type { AuditLogRow } from "./types"
import { toRecordLabel } from "./auditLogUtils"

export function AuditNarrative({ log }: { log: AuditLogRow }) {
  const recordLabel = toRecordLabel(log.targetType)
  const reference = `(${log.targetReferenceCode})`

  if (log.action === "REPORT_LINKED") {
    return <Sentence log={log} text="linked" recordLabel={recordLabel} reference={reference} suffix="to a Found Item." />
  }

  if (log.action === "REPORT_UPDATED") {
    return <Sentence log={log} text="updated the status of" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "ITEM_UPDATED") {
    return <Sentence log={log} text="updated details for" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "ITEM_CREATED") {
    return <Sentence log={log} text="logged" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "CLAIM_DENIED") {
    return <Sentence log={log} text="denied" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "CLAIM_APPROVED") {
    return <Sentence log={log} text="approved" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "CLAIM_SUBMITTED") {
    return <Sentence log={log} text="submitted" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "CLAIM_REVIEWED") {
    return <Sentence log={log} text="reviewed" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "HANDOVER_COMPLETED") {
    return <Sentence log={log} text="completed handover for" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "AUTH_LOGIN") {
    return (
      <>
        <span className="font-extrabold text-slate-900">{log.actorUser.name}</span> logged in to the system.
      </>
    )
  }

  if (log.action === "SNAPSHOT_DISMISSED") {
    return <Sentence log={log} text="dismissed" recordLabel={recordLabel} reference={reference} />
  }

  if (log.action === "SNAPSHOT_RESTORED") {
    return <Sentence log={log} text="restored" recordLabel={recordLabel} reference={reference} />
  }

  return <Sentence log={log} text="updated" recordLabel={recordLabel} reference={reference} />
}

function Sentence({
  log,
  text,
  recordLabel,
  reference,
  suffix,
}: {
  log: AuditLogRow
  text: string
  recordLabel: string
  reference: string
  suffix?: string
}) {
  return (
    <>
      <span className="font-extrabold text-slate-900">{log.actorUser.name}</span> {text} {recordLabel}{" "}
      <span className="font-extrabold text-slate-900">{reference}</span>
      {suffix ? ` ${suffix}` : "."}
    </>
  )
}
