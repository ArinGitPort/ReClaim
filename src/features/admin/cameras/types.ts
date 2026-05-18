export type CampusCamera = {
  id: string
  code: string
  name: string
  location: string
  sourceUrl: string
  isOnline: boolean
  aiEnabled: boolean
  zoneConfig?: CameraZoneConfig | null
  lastPingAtUtc: string | null
}

export type CameraZone = {
  label: string
  type?: "monitor" | "ignore"
  points?: Array<{ x: number; y: number }>
  x?: number
  y?: number
  width?: number
  height?: number
}

export type CameraZoneConfig = {
  monitoredZones: CameraZone[]
  ignoredZones: CameraZone[]
}
