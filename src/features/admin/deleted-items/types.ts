export type DeletedItem = {
  id: string
  code: string
  title: string
  category: string
  color: string
  foundLocation: string
  foundAtUtc: string
  storageLocation?: string | null
  privateDiscoveryNote?: string | null
  status: string
}
