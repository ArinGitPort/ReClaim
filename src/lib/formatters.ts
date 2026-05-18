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
