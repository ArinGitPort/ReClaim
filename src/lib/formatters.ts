export function formatShortDate(value?: string | null): string {
  if (!value) return "Never"

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "Never"

  return new Date(value).toLocaleString()
}

export function formatCompactDateTime(value?: string | null): string {
  if (!value) return "Never"

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}
