import React from 'react'

export function DetailSection({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
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
