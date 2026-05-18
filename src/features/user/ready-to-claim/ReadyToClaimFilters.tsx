import { Search } from "lucide-react"
import { UniversalFilterBar } from "@/components/ui/UniversalFilterBar"
import { RecordsStatusChips } from "@/features/user/RecordsStatusChips"
import { pickupSourceOptions } from "./readyToClaimOptions"

type ReadyToClaimFiltersProps = {
  search: string
  sourceFilter: string
  resultCount: number
  onSearchChange: (value: string) => void
  onSourceChange: (value: string) => void
}

export function ReadyToClaimFilters({
  search,
  sourceFilter,
  resultCount,
  onSearchChange,
  onSourceChange,
}: ReadyToClaimFiltersProps) {
  return (
    <>
      <UniversalFilterBar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by source code, item, inventory code, or token"
        dropdowns={[
          {
            id: "source",
            label: "Source Type",
            icon: <Search className="w-4 h-4" />,
            value: sourceFilter,
            onChange: onSourceChange,
            options: [
              { label: "All Types", value: "" },
              ...pickupSourceOptions,
            ],
          },
        ]}
      />

      <RecordsStatusChips
        statusValue={sourceFilter}
        onStatusChange={onSourceChange}
        statusOptions={pickupSourceOptions}
        resultCount={resultCount}
      />
    </>
  )
}
