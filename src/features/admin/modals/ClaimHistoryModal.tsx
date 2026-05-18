import { useEffect, useMemo, useState } from "react"
import { History, PackageCheck } from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { api } from "@/lib/api"
import { formatShortDate } from "@/lib/formatters"
import { formatStatusLabel } from "@/lib/status"
import type { UserDirectoryDetails, UserModalProps } from "@/features/admin/types"

export function ClaimHistoryModal({ isOpen, onClose, user }: UserModalProps) {
  const [details, setDetails] = useState<UserDirectoryDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !user) {
      return
    }

    setIsLoading(true)
    api.get<{ user: UserDirectoryDetails }>(`/user/${user.id}`)
      .then((response) => setDetails(response.data.user))
      .catch(() => setDetails(null))
      .finally(() => setIsLoading(false))
  }, [isOpen, user])

  const timeline = useMemo(() => {
    const claims = (details?.claims ?? []).map((claim) => ({
      id: `claim-${claim.id}`,
      kind: "Claim",
      code: claim.claimCode,
      title: claim.foundItem.title,
      meta: `${claim.foundItem.code} • ${claim.foundItem.category}`,
      status: claim.status,
      date: claim.createdAt,
    }))

    const handovers = (details?.handovers ?? []).map((handover) => ({
      id: `handover-${handover.id}`,
      kind: "Handover",
      code: handover.foundItem.code,
      title: handover.foundItem.title,
      meta: `Token ${handover.pickupTokenPresented}`,
      status: "RETURNED",
      date: handover.releasedAtUtc,
    }))

    return [...claims, ...handovers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [details])

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl overflow-hidden p-0 bg-white">
      <ModalHeader
        title="Account History"
        subtitle={`${user.name} • claims and returned items`}
        icon={<History className="w-5 h-5 text-white" />}
        onClose={onClose}
        containerClassName="bg-white"
        titleClassName="text-slate-900"
        iconWrapperClassName="bg-slate-700"
      />

      <div className="p-6 bg-slate-50/70 max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <EmptyState title="Loading history..." description="Fetching account activity." className="bg-white" />
        ) : timeline.length === 0 ? (
          <EmptyState
            icon={<PackageCheck className="h-9 w-9" />}
            title="No history yet"
            description="This account has no claims or returned-item handovers."
            className="bg-white"
          />
        ) : (
          <div className="space-y-3">
            {timeline.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{entry.kind} {"\u2022"} {entry.code}</span>
                      <StatusBadge status={formatStatusLabel(entry.status)} />
                    </div>
                    <h4 className="mt-2 text-base font-black text-slate-900">{entry.title}</h4>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{entry.meta}</p>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {formatShortDate(entry.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
