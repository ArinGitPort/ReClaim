export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  )
}

export function ProofField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/80 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-widest text-brand/70 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-700 wrap-break-word">{value}</div>
    </div>
  )
}
