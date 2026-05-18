import type { ReactNode } from "react"
import { Calendar, Edit, Eye, MapPin, Package, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/Skeleton"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { cn } from "@/lib/utils"
import { inventoryNextAction } from "./inventoryUtils"
import type { InventoryRow } from "./types"

type InventoryTableProps = {
  items: InventoryRow[]
  isLoading: boolean
  error: string | null
  focusCode: string
  onEdit: (item: InventoryRow) => void
  onDetails: (item: InventoryRow) => void
  onHandover: (item: InventoryRow) => void
}

export function InventoryTable({ items, isLoading, error, focusCode, onEdit, onDetails, onHandover }: InventoryTableProps) {
  return (
    <AdminTableContainer>
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
            <th className="px-8 py-5">Item Identifier</th>
            <th className="px-8 py-5">Found Item Specifications</th>
            <th className="px-8 py-5">Detection Record</th>
            <th className="px-8 py-5">Storage Facility</th>
            <th className="px-8 py-5">Status</th>
            <th className="px-8 py-5 text-right">Item Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <InventoryTableRow
              key={item.id}
              item={item}
              focusCode={focusCode}
              onEdit={onEdit}
              onDetails={onDetails}
              onHandover={onHandover}
            />
          ))}
          {isLoading && <InventoryTableSkeleton />}
          {!isLoading && items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-8 py-14 text-center text-slate-400 text-sm font-semibold">
                No inventory records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {error && <div className="px-8 py-4 text-sm font-semibold text-rose-600 border-t border-slate-100">{error}</div>}
    </AdminTableContainer>
  )
}

function InventoryTableRow({
  item,
  focusCode,
  onEdit,
  onDetails,
  onHandover,
}: {
  item: InventoryRow
  focusCode: string
  onEdit: (item: InventoryRow) => void
  onDetails: (item: InventoryRow) => void
  onHandover: (item: InventoryRow) => void
}) {
  return (
    <tr
      className={cn(
        "hover:bg-slate-50/80 transition-all group cursor-default",
        item.code.toUpperCase() === focusCode && "bg-brand/5 ring-2 ring-brand/20"
      )}
    >
      <td className="px-8 py-5 whitespace-nowrap">
        <span className="text-[11px] font-bold text-slate-500 font-mono tracking-tighter bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all">
          {item.code}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight">{item.title}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-slate-600 text-[12px] font-bold">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            {item.date}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-200 shrink-0" />
            <span className="truncate max-w-[120px]">{item.location}</span>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/50 text-[11px] font-bold text-slate-600 font-mono">
          {item.storage}
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="space-y-1.5">
          <StatusBadge status={item.status} />
          {inventoryNextAction(item) && (
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {inventoryNextAction(item)}
            </div>
          )}
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-2">
          <ActionIconButton
            label="Edit item"
            icon={<Edit className="w-4 h-4" />}
            buttonClassName="bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
            onClick={() => onEdit(item)}
          />
          <ActionIconButton
            label="View item details"
            icon={<Eye className="w-4 h-4" />}
            buttonClassName="bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300 hover:text-slate-900"
            onClick={() => onDetails(item)}
          />
          <Button
            type="button"
            onClick={() => onHandover(item)}
            disabled={!item.isHandoverReady}
            title={item.isHandoverReady ? "Start handover" : "Approve or link a claim before handover"}
            className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Start Handover
          </Button>
        </div>
      </td>
    </tr>
  )
}

function InventoryTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={`inventory-skeleton-${index}`}>
          <td colSpan={6} className="px-8 py-4">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

function ActionIconButton({
  label,
  icon,
  onClick,
  disabled,
  buttonClassName,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  buttonClassName: string
}) {
  return (
    <div className="relative group/tooltip">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "p-2.5 rounded-xl transition-all shadow-sm border disabled:opacity-45 disabled:cursor-not-allowed",
          buttonClassName
        )}
      >
        {icon}
      </button>
      <span className="pointer-events-none absolute bottom-full right-0 mb-2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-extrabold text-white opacity-0 translate-y-1 transition-all group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}
