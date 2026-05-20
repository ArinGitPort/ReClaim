import type { ReactNode } from "react"
import { Pencil, RefreshCw, Trash2, Video } from "lucide-react"
import { Switch } from "@/components/ui/Switch"
import { AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import type { CampusCamera } from "@/features/admin/cameras/types"
import { formatLastCameraPing, getCameraStatusClass, getCameraStatusDotClass, getCameraStatusLabel } from "./cameraSettingsUtils"

type CameraSettingsTableProps = {
  cameras: CampusCamera[]
  onToggleStream: (id: string, enabled: boolean) => void
  onToggleAi: (id: string, enabled: boolean) => void
  onEditClick: (camera: CampusCamera) => void
  onRetryClick: (camera: CampusCamera) => void
  onDeleteClick: (camera: CampusCamera) => void
}

export function CameraSettingsTable({ cameras, onToggleStream, onToggleAi, onEditClick, onRetryClick, onDeleteClick }: CameraSettingsTableProps) {
  return (
    <AdminTableContainer>
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
          <tr>
            <th className="px-8 py-5">Camera details</th>
            <th className="px-8 py-5">Status</th>
            <th className="px-8 py-5">Camera / AI</th>
            <th className="px-8 py-5">Last Ping</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cameras.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-slate-500">No cameras found.</td>
            </tr>
          ) : (
            cameras.map((camera) => (
              <tr key={camera.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                      <Video className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {camera.name}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">{camera.code}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        {camera.location} {"\u2022"} {camera.sourceUrl}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getCameraStatusClass(camera.streamStatus, camera.isOnline)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getCameraStatusDotClass(camera.streamStatus, camera.isOnline)}`} />
                    {getCameraStatusLabel(camera.streamStatus, camera.isOnline)}
                  </span>
                  {camera.lastError && (
                    <p className="mt-1 max-w-44 text-[10px] font-semibold text-rose-500">{camera.lastError}</p>
                  )}
                </td>
                <td className="px-8 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={camera.streamEnabled}
                        onCheckedChange={(value) => onToggleStream(camera.id, value)}
                      />
                      <span className={`text-xs font-bold leading-none ${camera.streamEnabled ? "text-slate-700" : "text-slate-400"}`}>
                        {camera.streamEnabled ? "CAMERA ON" : "CAMERA OFF"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                    <Switch
                      checked={camera.aiEnabled}
                      onCheckedChange={(value) => onToggleAi(camera.id, value)}
                      disabled={!camera.streamEnabled}
                    />
                    <span className={`text-xs font-bold leading-none ${!camera.isOnline ? "text-slate-300" : camera.aiEnabled ? "text-slate-700" : "text-slate-400"}`}>
                      {camera.aiEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className={`text-sm font-semibold ${camera.isOnline ? "text-slate-600" : "text-rose-600"}`}>
                    {formatLastCameraPing(camera.lastPingAtUtc, camera.isOnline)}
                  </div>
                  {camera.lastFrameAtUtc && (
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Frame {formatLastCameraPing(camera.lastFrameAtUtc, true)}
                    </div>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <ActionButton label="Retry" title="Reconnect camera" onClick={() => onRetryClick(camera)} tone="amber" icon={<RefreshCw className="h-3.5 w-3.5" />} />
                    <ActionButton label="Edit" title="Edit camera" onClick={() => onEditClick(camera)} icon={<Pencil className="h-3.5 w-3.5" />} />
                    <ActionButton label="Delete" title="Delete camera" onClick={() => onDeleteClick(camera)} tone="rose" icon={<Trash2 className="h-3.5 w-3.5" />} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableContainer>
  )
}

function ActionButton({
  label,
  title,
  icon,
  tone = "slate",
  onClick,
}: {
  label: string
  title: string
  icon: ReactNode
  tone?: "slate" | "brand" | "amber" | "rose"
  onClick: () => void
}) {
  const toneClass = {
    slate: "text-slate-600 hover:bg-slate-50",
    brand: "text-brand hover:bg-brand/5",
    amber: "text-amber-700 hover:bg-amber-50",
    rose: "text-rose-600 hover:bg-rose-50",
  }[tone]

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 border-r border-slate-200 px-3 text-[10px] font-black uppercase tracking-widest last:border-r-0 transition-colors ${toneClass}`}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  )
}
