export function formatLastCameraPing(utcStr: string | null) {
  if (!utcStr) return "Never pinged"

  const diffSeconds = Math.floor((Date.now() - new Date(utcStr).getTime()) / 1000)
  if (diffSeconds < 60) return `Active ${diffSeconds}s ago`

  const diffMins = Math.floor(diffSeconds / 60)
  if (diffMins < 60) return `Active ${diffMins}m ago`

  return `Offline for ${Math.floor(diffMins / 60)}h`
}

export function cameraMatchesSearch(camera: { name: string; code: string; location: string }, searchQuery: string) {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return true

  return (
    camera.name.toLowerCase().includes(query) ||
    camera.code.toLowerCase().includes(query) ||
    camera.location.toLowerCase().includes(query)
  )
}
