import { Cpu } from "lucide-react"
import { useAiServiceStatus } from "@/features/admin/live-monitor"

export function AdminAiStatusIndicator() {
  const { aiService } = useAiServiceStatus()
  const isRunning = Boolean(aiService?.running)

  return (
    <div
      className={`hidden lg:flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
        isRunning
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-400"
      }`}
      title={isRunning ? `AI service online${aiService?.device ? ` on ${aiService.device}` : ""}` : "AI service is off"}
    >
      <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
      <Cpu className="h-3.5 w-3.5" />
      <span>{isRunning ? "AI On" : "AI Off"}</span>
      {isRunning && aiService?.activeCameras.length ? (
        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] text-emerald-700">
          {aiService.activeCameras.length}
        </span>
      ) : null}
    </div>
  )
}
