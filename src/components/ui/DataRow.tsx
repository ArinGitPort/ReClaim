import React from 'react'
import { cn } from "@/lib/utils"

export function DataRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="group/item">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{label}</div>
      <div className={cn("text-[15px] font-bold text-slate-800 tracking-tight", mono && "font-mono tracking-tighter")}>{value}</div>
    </div>
  )
}
