import type { ChangeRow } from "./types"
import { stringifyValue, toObject } from "./auditLogUtils"

export function AuditPayloadPanel({ payload }: { payload: unknown }) {
  const payloadObject = toObject(payload)

  if (!payloadObject) {
    return <PayloadEmptyState message="No payload data recorded for this action." />
  }

  const changes = Array.isArray(payloadObject.changes) ? (payloadObject.changes as ChangeRow[]) : []

  if (changes.length > 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm bg-white">
        <table className="w-full min-w-max border-collapse text-left bg-white">
          <thead className="bg-slate-50/80 border-b border-slate-200/60">
            <tr className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3 border-r border-slate-200/60">Field Adjusted</th>
              <th className="px-4 py-3">Previous Value (Before)</th>
              <th className="px-4 py-3 border-l border-slate-200/60 bg-emerald-50/20">New Value (After)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {changes.map((change, index) => (
              <tr key={`${change.changedField}-${index}`} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-slate-700 bg-slate-50/30 border-r border-slate-100 group-hover:border-slate-200/60 align-top">
                  {change.changedField}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-rose-600/90 break-all bg-rose-50/10 align-top max-w-[200px]">
                  {stringifyValue(change.oldValue)}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-emerald-700 border-l border-slate-100 group-hover:border-slate-200/60 bg-emerald-50/20 break-all align-top max-w-[200px]">
                  {stringifyValue(change.newValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const payloadAfter = (payloadObject.after as Record<string, unknown>) || payloadObject
  const keys = Object.keys(payloadAfter).filter((key) => key !== "changes")

  if (keys.length === 0) {
    return <PayloadEmptyState message="No detailed payload changes recorded." />
  }

  return (
    <div className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/80 border-b border-slate-200/60">
          <tr className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            <th className="px-4 py-3 border-r border-slate-200/60 w-1/3">Payload Property</th>
            <th className="px-4 py-3 w-2/3">Recorded Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {keys.map((key) => (
            <tr key={key} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 text-xs font-bold text-slate-700 bg-slate-50/30 border-r border-slate-100 align-top break-all">
                {key}
              </td>
              <td className="px-4 py-3 text-xs font-semibold text-slate-600 align-top break-all max-w-[300px]">
                {stringifyValue(payloadAfter[key])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PayloadEmptyState({ message }: { message: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{message}</p>
    </div>
  )
}
