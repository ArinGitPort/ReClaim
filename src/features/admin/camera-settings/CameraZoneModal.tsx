import { useEffect, useMemo, useState } from "react"
import { Map, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import type { CameraZone, CameraZoneConfig, CampusCamera } from "@/features/admin/cameras/types"

type CameraZoneModalProps = {
  camera: CampusCamera | null
  onClose: () => void
  onSave: (camera: CampusCamera, zoneConfig: CameraZoneConfig | null) => Promise<void>
}

type DraftZone = {
  id: string
  kind: "monitor" | "ignore"
  label: string
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_ZONE: DraftZone = {
  id: "default-monitor",
  kind: "monitor",
  label: "Main watch area",
  x: 5,
  y: 15,
  width: 90,
  height: 75,
}

export function CameraZoneModal({ camera, onClose, onSave }: CameraZoneModalProps) {
  const [zones, setZones] = useState<DraftZone[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!camera) return
    setZones(camera.zoneConfig ? toDraftZones(camera.zoneConfig) : [DEFAULT_ZONE])
    setError(null)
  }, [camera])

  const zoneCounts = useMemo(() => ({
    monitored: zones.filter((zone) => zone.kind === "monitor").length,
    ignored: zones.filter((zone) => zone.kind === "ignore").length,
  }), [zones])

  if (!camera) return null

  function addZone(kind: DraftZone["kind"]) {
    setZones((current) => [
      ...current,
      {
        id: `${kind}-${Date.now()}`,
        kind,
        label: kind === "monitor" ? "Watch area" : "Ignore area",
        x: 10,
        y: 10,
        width: 35,
        height: 35,
      },
    ])
  }

  function updateZone(id: string, patch: Partial<DraftZone>) {
    setZones((current) => current.map((zone) => zone.id === id ? { ...zone, ...patch } : zone))
  }

  function removeZone(id: string) {
    setZones((current) => current.filter((zone) => zone.id !== id))
  }

  async function handleSave() {
    if (!camera) return

    setIsSaving(true)
    setError(null)
    try {
      validateDraftZones(zones)
      await onSave(camera, toZoneConfig(zones))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save zones.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleClear() {
    if (!camera) return

    setIsSaving(true)
    setError(null)
    try {
      await onSave(camera, null)
    } catch {
      setError("Unable to clear zones.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-0 overflow-hidden">
      <ModalHeader
        title="Camera Zones"
        icon={<Map className="w-5 h-5 text-white" />}
        onClose={onClose}
      />

      <div className="grid max-h-[72vh] grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="rounded-xl border border-brand/10 bg-brand/5 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{camera.name}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Draw simple frame zones by percentages. Monitored zones allow/boost abandoned-item alerts; ignored zones suppress alerts.
            </p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-brand">
              Current: {zoneCounts.monitored} monitored / {zoneCounts.ignored} ignored
            </p>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:10%_10%]" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase tracking-widest text-white/30">
              Camera Frame Preview
            </div>
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`absolute rounded-lg border-2 shadow-lg ${
                  zone.kind === "monitor"
                    ? "border-emerald-400 bg-emerald-400/20"
                    : "border-rose-400 bg-rose-400/20"
                }`}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
              >
                <span className={`absolute left-2 top-2 rounded px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white ${
                  zone.kind === "monitor" ? "bg-emerald-600" : "bg-rose-600"
                }`}>
                  {zone.label || "Unnamed"}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{error}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" onClick={() => addZone("monitor")} className="h-10 bg-emerald-600 text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Watch
            </Button>
            <Button type="button" onClick={() => addZone("ignore")} className="h-10 bg-rose-600 text-xs font-bold uppercase tracking-widest text-white hover:bg-rose-700">
              <Plus className="mr-2 h-4 w-4" />
              Ignore
            </Button>
          </div>

          <div className="space-y-3">
            {zones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                No zones configured
              </div>
            ) : (
              zones.map((zone) => (
                <ZoneEditor
                  key={zone.id}
                  zone={zone}
                  onChange={(patch) => updateZone(zone.id, patch)}
                  onRemove={() => removeZone(zone.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 p-6">
        <Button type="button" variant="outline" onClick={handleClear} disabled={isSaving} className="h-11 border-slate-200 px-5 text-xs font-bold uppercase tracking-widest text-slate-600">
          Clear Zones
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="ml-auto h-11 border-slate-200 px-7 text-xs font-bold uppercase tracking-widest text-slate-600">
          Cancel
        </Button>
        <Button type="button" onClick={() => void handleSave()} disabled={isSaving} className="h-11 bg-brand px-7 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-active">
          {isSaving ? "Saving..." : "Save Zones"}
        </Button>
      </div>
    </Modal>
  )
}

function ZoneEditor({
  zone,
  onChange,
  onRemove,
}: {
  zone: DraftZone
  onChange: (patch: Partial<DraftZone>) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
          zone.kind === "monitor" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        }`}>
          {zone.kind === "monitor" ? "Watch" : "Ignore"}
        </span>
        <button type="button" onClick={onRemove} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zone Name</label>
      <input
        value={zone.label}
        onChange={(event) => onChange({ label: event.target.value })}
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-800 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PercentInput label="Left" value={zone.x} onChange={(value) => onChange({ x: value })} />
        <PercentInput label="Top" value={zone.y} onChange={(value) => onChange({ y: value })} />
        <PercentInput label="Width" value={zone.width} onChange={(value) => onChange({ width: value })} />
        <PercentInput label="Height" value={zone.height} onChange={(value) => onChange({ height: value })} />
      </div>
    </div>
  )
}

function PercentInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <div className="mt-1 flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-2">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(event) => onChange(clampPercent(Number(event.target.value)))}
          className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
        />
        <span className="text-xs font-bold text-slate-400">%</span>
      </div>
    </label>
  )
}

function toDraftZones(config: CameraZoneConfig): DraftZone[] {
  return [
    ...(config.monitoredZones ?? []).map((zone, index) => toDraftZone(zone, "monitor", index)),
    ...(config.ignoredZones ?? []).map((zone, index) => toDraftZone(zone, "ignore", index)),
  ]
}

function toDraftZone(zone: CameraZone, kind: DraftZone["kind"], index: number): DraftZone {
  const rect = getZoneRectangle(zone)
  return {
    id: `${kind}-${index}-${zone.label}`,
    kind,
    label: zone.label,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  }
}

function getZoneRectangle(zone: CameraZone) {
  if (typeof zone.x === "number" && typeof zone.y === "number" && typeof zone.width === "number" && typeof zone.height === "number") {
    return {
      x: toPercent(zone.x),
      y: toPercent(zone.y),
      width: toPercent(zone.width),
      height: toPercent(zone.height),
    }
  }

  const points = zone.points ?? []
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const minX = Math.min(...xs, 0)
  const minY = Math.min(...ys, 0)
  const maxX = Math.max(...xs, 1)
  const maxY = Math.max(...ys, 1)
  return {
    x: toPercent(minX),
    y: toPercent(minY),
    width: toPercent(maxX - minX),
    height: toPercent(maxY - minY),
  }
}

function toZoneConfig(zones: DraftZone[]): CameraZoneConfig {
  return {
    monitoredZones: zones.filter((zone) => zone.kind === "monitor").map(toCameraZone),
    ignoredZones: zones.filter((zone) => zone.kind === "ignore").map(toCameraZone),
  }
}

function toCameraZone(zone: DraftZone): CameraZone {
  return {
    label: zone.label.trim(),
    x: zone.x / 100,
    y: zone.y / 100,
    width: zone.width / 100,
    height: zone.height / 100,
  }
}

function validateDraftZones(zones: DraftZone[]) {
  for (const zone of zones) {
    if (!zone.label.trim()) throw new Error("Every zone needs a name.")
    if (zone.width <= 0 || zone.height <= 0) throw new Error(`${zone.label} needs a width and height above 0%.`)
    if (zone.x + zone.width > 100 || zone.y + zone.height > 100) {
      throw new Error(`${zone.label} must stay inside the camera frame.`)
    }
  }
}

function toPercent(value: number) {
  return Math.round(clampPercent(value * 100))
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}
