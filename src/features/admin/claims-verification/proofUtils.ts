export function proofEntries(proof: Record<string, unknown>): Array<{ label: string; value: string }> {
  const entries = Object.entries(proof)
  if (entries.length === 0) {
    return [{ label: "Details", value: "No proof fields were submitted." }]
  }

  return entries.map(([key, value]) => ({
    label: prettifyProofKey(key),
    value: stringifyProofValue(value),
  }))
}

function stringifyProofValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.map((item) => stringifyProofValue(item)).join(", ")
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([nestedKey, nestedValue]) => `${prettifyProofKey(nestedKey)}: ${stringifyProofValue(nestedValue)}`)
      .join(" | ")
  }

  return "Not provided"
}

function prettifyProofKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
