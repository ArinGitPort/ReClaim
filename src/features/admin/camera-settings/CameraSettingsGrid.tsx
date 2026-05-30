import type { ReactNode } from "react"
import { Pencil, RefreshCw, Trash2, Video, Settings2, Activity, Cpu } from "lucide-react"
import { Switch } from "@/components/ui/Switch"
import type { CampusCamera } from "@/features/admin/cameras/types"
import { formatLastCameraPing, getCameraStatusClass, getCameraStatusDotClass, getCameraStatusLabel } from "./cameraSettingsUtils"

type CameraSettingsGridProps = {
  cameras: CampusCamera[]
  onToggleStream: (id: string, enabled: boolean) => void
  onToggleAi: (id: string, enabled: boolean) => void
  onEditClick: (camera: CampusCamera) => void
  onRetryClick: (camera: CampusCamera) => void
  onDeleteClick: (camera: CampusCamera) => void
}

export function CameraSettingsGrid({
  cameras,
  onToggleStream,
  onToggleAi,
  onEditClick,
  onRetryClick,
  onDeleteClick,
}: CameraSettingsGridProps) {
  if (cameras.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white border border-slate-200 p-16 text-center shadow-sm">
        <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No cameras found</h3>
        <p className="text-slate-500 text-sm">Add a new camera to start monitoring.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cameras.map((camera) => (
        <div key={camera.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-brand/20 group">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand text-white flex items-center justify-center shadow-inner">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-brand transition-colors">{camera.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-600 uppercase tracking-widest">{camera.code}</span>
                  <span className="text-xs font-semibold text-slate-500">{camera.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 space-y-6">
            {/* Status */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Connection Status</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getCameraStatusClass(camera.streamStatus, camera.isOnline)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 shadow-sm ${getCameraStatusDotClass(camera.streamStatus, camera.isOnline)}`} />
                    {getCameraStatusLabel(camera.streamStatus, camera.isOnline)}
                  </span>
                </div>
                {camera.lastError && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">{camera.lastError}</p>
                )}
                <div className="text-xs font-medium text-slate-500 flex justify-between mt-1">
                  <span>Ping: {formatLastCameraPing(camera.lastPingAtUtc, camera.isOnline)}</span>
                  {camera.lastFrameAtUtc && (
                    <span>Frame: {formatLastCameraPing(camera.lastFrameAtUtc, true)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Config */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-brand" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">AI Configuration</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Confidence</div>
                  <div className="text-sm font-black text-slate-700">{Math.round((camera.aiConfThreshold ?? 0.35) * 100)}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Frame Skip</div>
                  <div className="text-sm font-black text-slate-700">1 in {camera.aiFrameSkip ?? 6}</div>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={camera.streamEnabled}
                  onCheckedChange={(value) => onToggleStream(camera.id, value)}
                />
                <span className={`text-xs font-black tracking-widest uppercase ${camera.streamEnabled ? "text-slate-900" : "text-slate-400"}`}>
                  Camera
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={camera.aiEnabled}
                  onCheckedChange={(value) => onToggleAi(camera.id, value)}
                  disabled={!camera.streamEnabled}
                />
                <span className={`text-xs font-black tracking-widest uppercase ${!camera.streamEnabled ? "text-slate-300" : camera.aiEnabled ? "text-brand" : "text-slate-400"}`}>
                  AI Vision
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/50">
            <ActionButton label="Retry" onClick={() => onRetryClick(camera)} icon={<RefreshCw className="w-4 h-4" />} tone="amber" />
            <ActionButton label="Edit" onClick={() => onEditClick(camera)} icon={<Settings2 className="w-4 h-4" />} tone="slate" />
            <ActionButton label="Delete" onClick={() => onDeleteClick(camera)} icon={<Trash2 className="w-4 h-4" />} tone="rose" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ActionButton({
  label,
  icon,
  tone = "slate",
  onClick,
}: {
  label: string
  icon: ReactNode
  tone?: "slate" | "brand" | "amber" | "rose"
  onClick: () => void
}) {
  const toneClass = {
    slate: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    brand: "text-brand hover:bg-brand/10 hover:text-brand-active",
    amber: "text-amber-600 hover:bg-amber-50 hover:text-amber-700",
    rose: "text-rose-500 hover:bg-rose-50 hover:text-rose-700",
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 p-4 border-r border-slate-100 last:border-r-0 transition-all ${toneClass}`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  )
}
