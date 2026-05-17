import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle, MessageSquare, PackageCheck } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { UserDirectoryDetails, UserModalProps } from "@/features/admin/types"

export function PendingVerificationsModal({ isOpen, onClose, user }: UserModalProps) {
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

  const pendingClaims = useMemo(
    () => (details?.claims ?? []).filter((claim) => claim.status === "PENDING_VERIFICATION" || claim.status === "INQUIRY_REQUIRED"),
    [details]
  )

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl overflow-hidden p-0 bg-white">
      <ModalHeader
        title="Pending Verifications"
        subtitle={`${user.name} • claim review queue`}
        icon={<AlertCircle className="w-5 h-5 text-white" />}
        onClose={onClose}
        containerClassName="bg-white"
        titleClassName="text-slate-900"
        iconWrapperClassName="bg-amber-500"
      />

      <div className="p-6 bg-slate-50/70 max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <EmptyState title="Loading claims..." description="Fetching the latest verification records." />
        ) : pendingClaims.length === 0 ? (
          <EmptyState title="No pending verifications" description="This account has no claim tickets waiting for review." success />
        ) : (
          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{claim.claimCode}</span>
                      <StatusBadge status={formatStatus(claim.status)} />
                    </div>
                    <h4 className="mt-2 text-base font-black text-slate-900">{claim.foundItem.title}</h4>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {claim.foundItem.code} • {claim.foundItem.category} • {claim.foundItem.foundLocation}
                    </p>
                    {claim.reviewerNote && (
                      <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        {claim.reviewerNote}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    className="h-9 bg-brand hover:bg-brand-active text-xs font-bold uppercase tracking-widest text-white"
                    onClick={() => {
                      window.location.href = `/admin/claims?focus=${claim.claimCode}`
                    }}
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

function EmptyState({ title, description, success = false }: { title: string; description: string; success?: boolean }) {
  const Icon = success ? CheckCircle : PackageCheck
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <Icon className={`mx-auto mb-3 h-9 w-9 ${success ? "text-emerald-400" : "text-slate-300"}`} />
      <div className="text-sm font-black text-slate-700">{title}</div>
      <div className="mt-1 text-xs font-semibold text-slate-400">{description}</div>
    </div>
  )
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
}
