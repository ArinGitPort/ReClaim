import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { CalendarDays, Download, FileSpreadsheet, FileText, ImageIcon, Layers, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { cn } from "@/lib/utils"
import type { ExportFormat, ExportOptions } from "@/lib/exportUtils"

type AdminExportModalProps = {
  isOpen: boolean
  title: string
  hasImages: boolean
  canIncludeSensitive: boolean
  hasDateFilter: boolean
  activeFilters?: Array<{ label: string; value: string }>
  sensitiveDescription?: string
  isLoading?: boolean
  onClose: () => void
  onExport: (format: ExportFormat, options: ExportOptions) => void
}

const defaultOptions: ExportOptions = {
  includeImages: false,
  includeSensitive: false,
  scope: "all",
  firstRecordCount: 100,
  pageFrom: 1,
  pageTo: 1,
  pageSize: 100,
  dateFrom: "",
  dateTo: "",
}

export function AdminExportModal({
  isOpen,
  title,
  hasImages,
  canIncludeSensitive,
  hasDateFilter,
  activeFilters,
  sensitiveDescription,
  isLoading = false,
  onClose,
  onExport,
}: AdminExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [options, setOptions] = useState<ExportOptions>(defaultOptions)
  const isPdf = format === "pdf"
  const formatLabel = isPdf ? "PDF Report" : "CSV"
  const formatIcon = isPdf ? <FileText className="h-5 w-5 text-white" /> : <FileSpreadsheet className="h-5 w-5 text-white" />
  const canSubmit = useMemo(() => {
    if (options.dateFrom && options.dateTo && options.dateFrom > options.dateTo) return false
    if (options.scope === "first") return options.firstRecordCount > 0
    if (options.scope === "pages") return options.pageFrom > 0 && options.pageTo >= options.pageFrom && options.pageSize > 0
    return true
  }, [options])

  useEffect(() => {
    if (isOpen) {
      setFormat("csv")
      setOptions(defaultOptions)
    }
  }, [isOpen])

  function updateOption<Key extends keyof ExportOptions>(key: Key, value: ExportOptions[Key]) {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOutsideClick={!isLoading} className="max-w-3xl p-0">
      <ModalHeader
        title="Export Records"
        subtitle={title}
        icon={<Download className="h-5 w-5 text-white" />}
        onClose={onClose}
        iconWrapperClassName="bg-brand"
      />

      <div className="max-h-[72vh] overflow-y-auto p-6">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <section className="space-y-4">
            <OptionSection icon={<Download className="h-4 w-4" />} title="Format">
              <div className="grid gap-2 sm:grid-cols-2">
                <RadioCard
                  checked={format === "csv"}
                  title="CSV"
                  description="Spreadsheet-friendly file for sorting and analysis."
                  onClick={() => setFormat("csv")}
                />
                <RadioCard
                  checked={format === "pdf"}
                  title="PDF Report"
                  description="Printable report view for review or filing."
                  onClick={() => setFormat("pdf")}
                />
              </div>
            </OptionSection>

            <OptionSection icon={<Layers className="h-4 w-4" />} title="Records">
              <div className="grid gap-2">
                <RadioCard
                  checked={options.scope === "all"}
                  title="All filtered records"
                  description="Uses the filters currently active on this page."
                  onClick={() => updateOption("scope", "all")}
                />
                <RadioCard
                  checked={options.scope === "first"}
                  title="First records"
                  description="Export only the first set after current sorting and filters."
                  onClick={() => updateOption("scope", "first")}
                />
                {options.scope === "first" && (
                  <NumberInput
                    label="Record count"
                    min={1}
                    value={options.firstRecordCount}
                    onChange={(value) => updateOption("firstRecordCount", value)}
                  />
                )}
                <RadioCard
                  checked={options.scope === "pages"}
                  title="Page range"
                  description="Choose export pages using a fixed records-per-page size."
                  onClick={() => updateOption("scope", "pages")}
                />
                {options.scope === "pages" && (
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                    <NumberInput label="From page" min={1} value={options.pageFrom} onChange={(value) => updateOption("pageFrom", value)} />
                    <NumberInput label="To page" min={options.pageFrom} value={options.pageTo} onChange={(value) => updateOption("pageTo", value)} />
                    <NumberInput label="Rows/page" min={1} value={options.pageSize} onChange={(value) => updateOption("pageSize", value)} />
                  </div>
                )}
              </div>
            </OptionSection>

            <OptionSection icon={<CalendarDays className="h-4 w-4" />} title="Date Range">
              {hasDateFilter ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <DateInput label="From" value={options.dateFrom} onChange={(value) => updateOption("dateFrom", value)} />
                  <DateInput label="To" value={options.dateTo} onChange={(value) => updateOption("dateTo", value)} />
                </div>
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                  This page does not expose a date field for export filtering yet.
                </p>
              )}
            </OptionSection>
          </section>

          <section className="space-y-4">
            <OptionSection icon={<ImageIcon className="h-4 w-4" />} title="Output">
              <div className="space-y-2">
                {hasImages ? (
                  <ToggleRow
                    checked={options.includeImages}
                    title="Include thumbnails"
                    description={isPdf ? "Adds compact images to the report." : "Adds image URLs to the CSV."}
                    onChange={(checked) => updateOption("includeImages", checked)}
                  />
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                    This export is list-only because these records do not have image evidence.
                  </p>
                )}

                {canIncludeSensitive && (
                  <ToggleRow
                    checked={options.includeSensitive}
                    title="Include sensitive fields"
                    description="Requires careful handling after export."
                    tone="warning"
                    onChange={(checked) => updateOption("includeSensitive", checked)}
                  />
                )}
              </div>
            </OptionSection>

            {options.includeSensitive && canIncludeSensitive && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                <div className="mb-2 flex items-center gap-2 font-black uppercase tracking-widest text-amber-700">
                  <ShieldAlert className="h-4 w-4" />
                  Sensitive Export
                </div>
                <p className="leading-relaxed">
                  {sensitiveDescription ?? "This export may include private operational details. Keep the file internal and share only with authorized users."}
                </p>
              </div>
            )}

            {activeFilters?.length ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Active Filters</p>
                <div className="space-y-2">
                  {activeFilters.map((filter) => (
                    <div key={`${filter.label}-${filter.value}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-slate-500">{filter.label}</span>
                      <span className="truncate font-black text-slate-900">{filter.value || "All"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 p-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="h-11 rounded-xl border-slate-200 px-5 font-bold text-slate-600"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => onExport(format, options)}
          disabled={isLoading || !canSubmit}
          className={cn(
            "h-11 rounded-xl px-6 font-black text-white shadow-sm",
            isPdf ? "bg-brand hover:bg-brand-active" : "bg-emerald-600 hover:bg-emerald-700",
          )}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : formatIcon}
          {isLoading ? "Exporting..." : `Export ${formatLabel}`}
        </Button>
      </div>
    </Modal>
  )
}

function OptionSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <span className="text-brand">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

function RadioCard({ checked, title, description, onClick }: { checked: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
        checked ? "border-brand bg-brand/5" : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <span className={cn("mt-1 h-4 w-4 rounded-full border-2", checked ? "border-brand bg-brand shadow-[inset_0_0_0_3px_white]" : "border-slate-300")} />
      <span>
        <span className="block text-sm font-black text-slate-900">{title}</span>
        <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-500">{description}</span>
      </span>
    </button>
  )
}

function ToggleRow({
  checked,
  title,
  description,
  tone = "default",
  onChange,
}: {
  checked: boolean
  title: string
  description: string
  tone?: "default" | "warning"
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border p-3",
        tone === "warning" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={cn("h-4 w-4 rounded", tone === "warning" ? "border-amber-300 text-amber-600 focus:ring-amber-500" : "border-slate-300 text-brand focus:ring-brand")}
      />
      <span>
        <span className={cn("block text-sm font-black", tone === "warning" ? "text-amber-800" : "text-slate-900")}>{title}</span>
        <span className={cn("mt-1 block text-xs font-semibold", tone === "warning" ? "text-amber-700" : "text-slate-500")}>{description}</span>
      </span>
    </label>
  )
}

function NumberInput({ label, min, value, onChange }: { label: string; min: number; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
      />
    </label>
  )
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
      />
    </label>
  )
}
