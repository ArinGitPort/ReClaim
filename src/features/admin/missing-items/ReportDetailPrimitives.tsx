import type { ReactNode } from "react"

export function DetailSection({ title, children, icon }: { title: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 pb-3 bg-brand/5 -mx-3 px-3 py-1 rounded-lg w-fit">
        {icon || <div className="w-1.5 h-1.5 rounded-full bg-brand" />}
        <h5 className="text-[11px] font-extrabold text-brand uppercase tracking-[0.2em]">{title}</h5>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  )
}

export function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="group/item">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{label}</div>
      <div className="text-[15px] font-bold text-slate-800 tracking-tight">{value}</div>
    </div>
  )
}
