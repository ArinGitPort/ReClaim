import { CameraFeed } from "./CameraFeed"
import type { CampusCamera, LiveMonitorViewMode } from "./types"

type CameraMonitorPanelProps = {
  cameras: CampusCamera[]
  filteredCameras: CampusCamera[]
  activeCam?: CampusCamera
  activeCamId: string | null
  viewMode: LiveMonitorViewMode
  time: string
  onFocusCamera: (cameraId: string) => void
  onSelectCamera: (cameraId: string) => void
}

export function CameraMonitorPanel({
  cameras,
  filteredCameras,
  activeCam,
  activeCamId,
  viewMode,
  time,
  onFocusCamera,
  onSelectCamera,
}: CameraMonitorPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
      {cameras.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-400 font-bold">No cameras found. Add one in Camera Settings.</div>
      ) : filteredCameras.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-400 font-bold">No cameras in this location.</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 h-full content-start">
          {filteredCameras.map((camera, index) => (
            <CameraFeed
              key={camera.id}
              cam={camera}
              idx={index}
              time={time}
              onClick={() => onFocusCamera(camera.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-full gap-3 relative">
          <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            {activeCam && <CameraFeed cam={activeCam} idx={0} time={time} isFocus />}
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 flex-shrink-0 h-24 sm:h-32">
            {filteredCameras.map((camera, index) => (
              <button
                key={camera.id}
                type="button"
                onClick={() => onSelectCamera(camera.id)}
                className={`w-32 sm:w-48 flex-shrink-0 relative cursor-pointer border-2 transition-all rounded-lg overflow-hidden ${activeCamId === camera.id ? "border-brand" : "border-transparent hover:border-slate-300"}`}
              >
                <CameraFeed cam={camera} idx={index} time={time} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
