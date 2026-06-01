import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { AdminExportModal } from "@/features/admin/components/AdminExportModal"
import {
  applyExportOptions,
  downloadCsv,
  openPrintableReport,
  openPrintableReportWindow,
  type ExportColumn,
  type ExportFormat,
  type ExportImage,
  type ExportOptions,
} from "@/lib/exportUtils"
import { cn } from "@/lib/utils"

type AdminExportButtonProps<T = unknown> = {
  label?: string
  disabled?: boolean
  className?: string
  title?: string
  filename?: string
  columns?: ExportColumn<T>[]
  fetchRows?: () => Promise<T[]>
  image?: ExportImage<T>
  filters?: Array<{ label: string; value: string }>
  sensitiveDescription?: string
  getRowDate?: (row: T) => string | Date | null | undefined
}

export function AdminExportButton<T = unknown>({
  label = "Export",
  disabled,
  className,
  title = "Admin Export",
  filename = "reclaim-export",
  columns = [],
  fetchRows,
  image,
  filters,
  sensitiveDescription,
  getRowDate,
}: AdminExportButtonProps<T>) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { user } = useAuth()
  const hasSensitiveColumns = columns.some((column) => column.sensitive)
  const canIncludeSensitive = user?.role === "ADMIN" && hasSensitiveColumns
  const isDisabled = disabled || !fetchRows || columns.length === 0 || isExporting

  async function runExport(format: ExportFormat, options: ExportOptions) {
    if (!fetchRows) return
    setIsExporting(true)
    const printWindow = format === "pdf" ? openPrintableReportWindow(title) : null
    if (format === "pdf" && !printWindow) {
      setIsExporting(false)
      setIsModalOpen(false)
      window.alert("Unable to open printable report. Please allow pop-ups for this site.")
      return
    }
    try {
      const rows = applyExportOptions(await fetchRows(), options, getRowDate)
      if (format === "csv") {
        downloadCsv({
          filename,
          rows,
          columns,
          includeSensitive: options.includeSensitive && canIncludeSensitive,
          image,
          includeImages: options.includeImages,
        })
      } else {
        openPrintableReport({
          metadata: {
            title,
            generatedBy: user?.name,
            generatedRole: user?.role,
            filters: buildExportMetadataFilters(filters, options, Boolean(getRowDate)),
            imageMode: image && options.includeImages ? "Thumbnails" : "List only",
          },
          rows,
          columns,
          includeSensitive: options.includeSensitive && canIncludeSensitive,
          image,
          includeImages: options.includeImages,
          printWindow,
        })
      }
    } catch (error) {
      printWindow?.close()
      window.alert(error instanceof Error ? error.message : "Unable to complete export.")
    } finally {
      setIsExporting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isDisabled}
        onClick={() => setIsModalOpen(true)}
        className={cn("h-10 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl", className)}
      >
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        {isExporting ? "Exporting..." : label}
      </Button>

      <AdminExportModal
        isOpen={isModalOpen}
        title={title}
        hasImages={Boolean(image)}
        canIncludeSensitive={canIncludeSensitive}
        hasDateFilter={Boolean(getRowDate)}
        activeFilters={filters}
        sensitiveDescription={sensitiveDescription}
        onClose={() => {
          if (!isExporting) setIsModalOpen(false)
        }}
        onExport={(format, options) => void runExport(format, options)}
        isLoading={isExporting}
      />
    </>
  )
}

function buildExportMetadataFilters(
  filters: Array<{ label: string; value: string }> | undefined,
  options: ExportOptions,
  hasDateFilter: boolean,
) {
  const metadata = [...(filters ?? [])]
  if (options.scope === "first") {
    metadata.push({ label: "Scope", value: `First ${options.firstRecordCount} records` })
  } else if (options.scope === "pages") {
    metadata.push({ label: "Scope", value: `Pages ${options.pageFrom}-${options.pageTo}, ${options.pageSize} rows/page` })
  } else {
    metadata.push({ label: "Scope", value: "All filtered records" })
  }

  if (hasDateFilter && (options.dateFrom || options.dateTo)) {
    metadata.push({
      label: "Date Range",
      value: `${options.dateFrom || "Start"} to ${options.dateTo || "Now"}`,
    })
  }

  return metadata
}
