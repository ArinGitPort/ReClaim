import { useEffect, useState } from "react"
import { Expand, Radio } from "lucide-react"
import { AI_STREAM_BASE_URL } from "@/lib/constants"
import type { CampusCamera } from "./types"

type CameraFeedProps = {
  cam: CampusCamera
  idx: number
  time: string
  isFocus?: boolean
  onClick?: () => void
}

export function CameraFeed({ cam, idx: _idx, time, isFocus, onClick }: CameraFeedProps) {
  const [imageError, setImageError] = useState(false)
  const isStreaming = cam.isOnline
  const isAiActive = cam.isOnline && cam.aiEnabled

  useEffect(() => {
    setImageError(!isStreaming)
  }, [isStreaming])

  return (
    <div
      className={`group w-full h-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {!imageError && isStreaming ? (
        <img
          src={`${AI_STREAM_BASE_URL}/${cam.id}`}
          alt={`Live feed from ${cam.name}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-800 font-mono text-sm">
          <Radio className="w-8 h-8 mb-2 opacity-20" />
          <span className={isFocus ? "text-lg text-slate-700" : "text-xs text-slate-700"}>
            {!cam.isOnline ? "OFFLINE" : "STREAM_UNAVAILABLE"}
          </span>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
            {isStreaming ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            )}
            {cam.code} {!onClick && `- ${cam.location}`}
          </div>
          <div className={`self-start px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${isAiActive ? "bg-brand text-white" : "bg-slate-800/80 text-slate-400"}`}>
            {isAiActive ? "AI_ACTIVE" : "RAW_FEED"}
          </div>
        </div>

        {(!onClick || isFocus) && (
          <div className="hidden sm:block bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-white/90">
            {time}
          </div>
        )}
      </div>

      {onClick && !isFocus && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Expand className="w-8 h-8 text-white/80" />
        </div>
      )}
    </div>
  )
}
