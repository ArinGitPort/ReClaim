export type CampusCamera = {
  id: string
  code: string
  name: string
  location: string
  sourceUrl: string
  isOnline: boolean
  aiEnabled: boolean
  lastPingAtUtc: string | null
}
