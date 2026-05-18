export function getExpiredDays(foundAtUtc: string, retentionDays: number) {
  const foundDate = new Date(foundAtUtc)
  return Math.floor((Date.now() - foundDate.getTime()) / (1000 * 3600 * 24)) - retentionDays
}

export function formatExpiredSince(foundAtUtc: string, retentionDays: number) {
  const expiredDays = getExpiredDays(foundAtUtc, retentionDays)
  return expiredDays > 0 ? `${expiredDays} days ago` : "Today"
}
