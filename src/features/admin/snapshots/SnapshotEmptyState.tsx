import { ScanSearch } from "lucide-react"

type SnapshotEmptyStateProps = {
  title: string
  description: string
}

export function SnapshotEmptyState({ title, description }: SnapshotEmptyStateProps) {
  return (
    <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
      <ScanSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}
