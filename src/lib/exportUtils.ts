import { api } from "@/lib/api"

export type ExportColumn<T> = {
  header: string
  getValue: (row: T) => unknown
  sensitive?: boolean
}

export type ExportImage<T> = {
  header: string
  getUrl: (row: T) => string | null | undefined
  getAlt?: (row: T) => string
}

export type ExportFormat = "csv" | "pdf"

export type ExportScope = "all" | "first" | "pages"

export type ExportOptions = {
  includeImages: boolean
  includeSensitive: boolean
  scope: ExportScope
  firstRecordCount: number
  pageFrom: number
  pageTo: number
  pageSize: number
  dateFrom: string
  dateTo: string
}

export type ExportMetadata = {
  title: string
  generatedBy?: string
  generatedRole?: string
  filters?: Array<{ label: string; value: string }>
  imageMode?: "List only" | "Thumbnails"
}

export function openPrintableReportWindow(title = "Preparing report") {
  const printWindow = window.open("", "_blank", "width=1200,height=800")
  if (!printWindow) return null

  printWindow.opener = null
  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, sans-serif; color: #0f172a; background: #f8fafc; }
          div { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 28px; background: #fff; box-shadow: 0 10px 30px rgba(15, 23, 42, .08); }
          h1 { margin: 0; font-size: 18px; }
          p { margin: 8px 0 0; color: #64748b; font-size: 13px; font-weight: 700; }
        </style>
      </head>
      <body><div><h1>Preparing report</h1><p>Collecting filtered records...</p></div></body>
    </html>`)
  printWindow.document.close()
  return printWindow
}

export function downloadCsv<T>(input: {
  filename: string
  rows: T[]
  columns: ExportColumn<T>[]
  includeSensitive: boolean
  image?: ExportImage<T>
  includeImages?: boolean
}) {
  const columns = input.columns.map((column) => column.header)
  if (input.image && input.includeImages) columns.push(input.image.header)

  const body = input.rows.map((row) => {
    const values = input.columns.map((column) => (
      column.sensitive && !input.includeSensitive ? "REDACTED" : stringifyExportValue(column.getValue(row))
    ))
    if (input.image && input.includeImages) values.push(toAbsoluteUrl(input.image.getUrl(row)) ?? "")
    return values.map(escapeCsvValue).join(",")
  })

  const csv = [columns.map(escapeCsvValue).join(","), ...body].join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = ensureCsvFilename(input.filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function openPrintableReport<T>(input: {
  metadata: ExportMetadata
  rows: T[]
  columns: ExportColumn<T>[]
  includeSensitive: boolean
  image?: ExportImage<T>
  includeImages?: boolean
  printWindow?: Window | null
}) {
  const printWindow = input.printWindow ?? openPrintableReportWindow(input.metadata.title)
  if (!printWindow) {
    throw new Error("Unable to open printable report. Please allow pop-ups for this site.")
  }

  const imageColumn = input.image && input.includeImages
    ? `<th>${escapeHtml(input.image.header)}</th>`
    : ""

  const rowsHtml = input.rows.map((row) => {
    const imageCell = input.image && input.includeImages
      ? `<td class="image-cell">${renderImage(input.image.getUrl(row), input.image.getAlt?.(row))}</td>`
      : ""
    const cells = input.columns.map((column) => {
      const value = column.sensitive && !input.includeSensitive ? "REDACTED" : stringifyExportValue(column.getValue(row))
      return `<td>${escapeHtml(value)}</td>`
    }).join("")
    return `<tr>${imageCell}${cells}</tr>`
  }).join("")

  const filterHtml = input.metadata.filters?.length
    ? `<div class="meta-grid">${input.metadata.filters.map((filter) => `
        <div><span>${escapeHtml(filter.label)}</span><strong>${escapeHtml(filter.value || "All")}</strong></div>
      `).join("")}</div>`
    : ""

  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <title>${escapeHtml(input.metadata.title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 32px; font-family: Arial, sans-serif; color: #0f172a; background: #fff; }
          header { border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 24px; }
          h1 { margin: 0; font-size: 24px; }
          .subtitle { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-top: 8px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
          .meta-grid div { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; }
          .meta-grid span { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: .08em; }
          .meta-grid strong { display: block; margin-top: 4px; font-size: 12px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; }
          th { background: #f1f5f9; color: #334155; text-align: left; text-transform: uppercase; letter-spacing: .06em; font-size: 9px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; word-break: break-word; }
          tr:nth-child(even) td { background: #f8fafc; }
          .image-cell { width: 84px; }
          .thumb { width: 72px; height: 54px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; }
          .no-image { display: inline-block; color: #94a3b8; font-weight: 700; font-size: 10px; }
          footer { margin-top: 24px; color: #64748b; font-size: 10px; }
          @media print {
            body { padding: 18px; }
            header { break-after: avoid; }
            tr { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(input.metadata.title)}</h1>
          <div class="subtitle">
            Generated ${escapeHtml(new Date().toLocaleString())}
            ${input.metadata.generatedBy ? ` by ${escapeHtml(input.metadata.generatedBy)}` : ""}
            ${input.metadata.generatedRole ? ` (${escapeHtml(input.metadata.generatedRole)})` : ""}
            &middot; ${input.rows.length} record${input.rows.length === 1 ? "" : "s"}
            &middot; ${escapeHtml(input.metadata.imageMode ?? "List only")}
          </div>
          ${filterHtml}
        </header>
        <table>
          <thead><tr>${imageColumn}${input.columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("")}</tr></thead>
          <tbody>${rowsHtml || `<tr><td colspan="${input.columns.length + (imageColumn ? 1 : 0)}">No records found.</td></tr>`}</tbody>
        </table>
        <footer>ReClaim administrative export. Sensitive fields may be redacted based on role and export options.</footer>
        <script>window.setTimeout(() => window.print(), 500)</script>
      </body>
    </html>`)
  printWindow.document.close()
}

export async function fetchAllPages<T>(input: {
  endpoint: string
  params?: Record<string, unknown>
  dataKey: string
  pageSize?: number
  pageCountPath?: string
}) {
  const pageSize = input.pageSize ?? 100
  const first = await api.get(input.endpoint, {
    params: {
      ...input.params,
      page: 1,
      limit: pageSize,
    },
  })
  const firstRows = readPath<T[]>(first.data, input.dataKey) ?? []
  const pageCount = Number(readPath(first.data, input.pageCountPath ?? "pagination.pageCount") ?? 1)
  const rows = [...firstRows]

  for (let page = 2; page <= pageCount; page += 1) {
    const response = await api.get(input.endpoint, {
      params: {
        ...input.params,
        page,
        limit: pageSize,
      },
    })
    rows.push(...(readPath<T[]>(response.data, input.dataKey) ?? []))
  }

  return rows
}

export function stringifyExportValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-"
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.map(stringifyExportValue).join("; ")
  return JSON.stringify(value)
}

export function formatExportDate(value?: string | null): string {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export function applyExportOptions<T>(
  rows: T[],
  options: ExportOptions,
  getRowDate?: (row: T) => string | Date | null | undefined,
) {
  const filteredByDate = getRowDate
    ? rows.filter((row) => isWithinDateRange(getRowDate(row), options.dateFrom, options.dateTo))
    : rows

  if (options.scope === "first") {
    return filteredByDate.slice(0, Math.max(1, options.firstRecordCount))
  }

  if (options.scope === "pages") {
    const pageSize = Math.max(1, options.pageSize)
    const from = Math.max(1, Math.min(options.pageFrom, options.pageTo))
    const to = Math.max(from, options.pageTo)
    return filteredByDate.slice((from - 1) * pageSize, to * pageSize)
  }

  return filteredByDate
}

export function toAbsoluteUrl(value?: string | null): string | null {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
  const origin = apiBase.replace(/\/api\/?$/, "")
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`
}

function ensureCsvFilename(filename: string) {
  return filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderImage(value?: string | null, alt?: string) {
  const url = toAbsoluteUrl(value)
  if (!url) return `<span class="no-image">No image</span>`
  return `<img class="thumb" src="${escapeHtml(url)}" alt="${escapeHtml(alt ?? "Export image")}" />`
}

function isWithinDateRange(value: string | Date | null | undefined, dateFrom: string, dateTo: string) {
  if (!dateFrom && !dateTo) return true
  if (!value) return false

  const time = value instanceof Date ? value.getTime() : new Date(value).getTime()
  if (Number.isNaN(time)) return false

  if (dateFrom) {
    const fromTime = new Date(`${dateFrom}T00:00:00`).getTime()
    if (time < fromTime) return false
  }

  if (dateTo) {
    const toTime = new Date(`${dateTo}T23:59:59.999`).getTime()
    if (time > toTime) return false
  }

  return true
}

function readPath<T = unknown>(source: unknown, path: string): T | undefined {
  const segments = path.split(".")
  let current = source as Record<string, unknown> | undefined
  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined
    current = current[segment] as Record<string, unknown> | undefined
  }
  return current as T | undefined
}
