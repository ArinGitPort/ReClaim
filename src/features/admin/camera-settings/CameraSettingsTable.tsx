import { Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/Switch"
import { AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import type { CampusCamera } from "@/features/admin/cameras/types"
import { formatLastCameraPing } from "./cameraSettingsUtils"

type CameraSettingsTableProps = {
  cameras: CampusCamera[]
  onToggleAi: (id: string, enabled: boolean) => void
  onDeleteClick: (camera: CampusCamera) => void
}

export function CameraSettingsTable({ cameras, onToggleAi, onDeleteClick }: CameraSettingsTableProps) {
  return (
    <AdminTableContainer>
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
          <tr>
            <th className="px-8 py-5">Camera details</th>
            <th className="px-8 py-5">Status</th>
            <th className="px-8 py-5">AI Detection</th>
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
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    camera.isOnline ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${camera.isOnline ? "bg-green-500" : "bg-rose-500"}`} />
                    {camera.isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={camera.aiEnabled}
                      onCheckedChange={(value) => onToggleAi(camera.id, value)}
                      disabled={!camera.isOnline}
                    />
                    <span className={`text-xs font-bold leading-none ${!camera.isOnline ? "text-slate-300" : camera.aiEnabled ? "text-slate-700" : "text-slate-400"}`}>
                      {camera.aiEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className={`text-sm font-semibold ${camera.isOnline ? "text-slate-600" : "text-rose-600"}`}>
                    {formatLastCameraPing(camera.lastPingAtUtc)}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onDeleteClick(camera)}
                    className="h-8 border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 text-[10px] font-bold uppercase tracking-widest text-rose-600"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableContainer>
  )
}
