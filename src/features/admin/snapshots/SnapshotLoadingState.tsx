type SnapshotLoadingStateProps = {
  message: string
}

export function SnapshotLoadingState({ message }: SnapshotLoadingStateProps) {
  return (
    <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-slate-500 font-semibold">{message}</p>
    </div>
  )
}
