import { useEffect, useMemo, useState } from "react"
import { FileSearch, PackageSearch } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { api } from "@/lib/api"
import type { UserDirectoryDetails, UserModalProps } from "@/features/admin/types"

const activeReportStatuses = new Set(["SUBMITTED", "UNDER_REVIEW", "ACTIVE_SEARCH", "MATCHED"])

export function MissingReportsModal({ isOpen, onClose, user }: UserModalProps) {
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

  const reports = useMemo(
    () => (details?.reports ?? []).filter((report) => activeReportStatuses.has(report.status)),
    [details]
  )

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl overflow-hidden p-0 bg-white">
      <ModalHeader
        title="Missing Reports"
        subtitle={`${user.name} • active lost-item reports`}
        icon={<PackageSearch className="w-5 h-5 text-white" />}
        onClose={onClose}
        containerClassName="bg-white"
        titleClassName="text-slate-900"
        iconWrapperClassName="bg-emerald-600"
      />

      <div className="p-6 bg-slate-50/70 max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <EmptyState title="Loading reports..." description="Fetching active missing-item records." />
        ) : reports.length === 0 ? (
          <EmptyState title="No active reports" description="This account has no active missing-item reports." />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{report.reportCode}</span>
                      <StatusBadge status={formatStatus(report.status)} />
                    </div>
                    <h4 className="mt-2 text-base font-black text-slate-900">{report.title}</h4>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {report.category} • Lost near {report.location} • Reported {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`/admin/reports?focus=${report.reportCode}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:bg-emerald-100"
                  >
                    Open Report
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <FileSearch className="mx-auto mb-3 h-9 w-9 text-slate-300" />
      <div className="text-sm font-black text-slate-700">{title}</div>
      <div className="mt-1 text-xs font-semibold text-slate-400">{description}</div>
    </div>
  )
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
}
