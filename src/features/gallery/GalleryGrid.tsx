import { ItemCard } from "@/features/gallery/ItemCard"
import type { FoundItem } from "@/features/gallery/ItemCard"
import { SearchX } from "lucide-react"

// Canonical items — mirrors admin Inventory (ITEM-8291 through ITEM-8286)
const mockItems: FoundItem[] = [
  { id: "ITEM-8291", title: "Apple MacBook Pro M2", category: "Electronics", location: "Main Library - 2nd Floor", dateLost: "2026-03-14T08:00:00Z", isHighValue: true },
  { id: "ITEM-8290", title: "Black Leather Wallet", category: "Wallets/IDs", location: "Gymnasium - Locker Room", dateLost: "2026-03-15T17:00:00Z", isHighValue: true },
  { id: "ITEM-8289", title: "Blue Hydroflask 32oz", category: "Everyday Items", location: "Student Union - Cafeteria", dateLost: "2026-03-13T12:30:00Z", isHighValue: false },
  { id: "ITEM-8288", title: "Keys with Honda Lanyard", category: "Everyday Items", location: "Main Library - Entrance", dateLost: "2026-03-10T09:15:00Z", isHighValue: false },
  { id: "ITEM-8286", title: "Sony WH-1000XM4 Headphones", category: "Electronics", location: "Main Library - Quiet Zone", dateLost: "2026-03-12T14:20:00Z", isHighValue: true },
]

export function GalleryGrid() {
  const items = mockItems

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 lg:p-24 border-2 border-dashed border-border-divider/50 rounded-xl bg-background-subtle/30">
        <SearchX className="w-12 h-12 text-text-secondary mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-text-primary mb-2">No items found</h3>
        <p className="text-text-secondary text-center max-w-sm">
          We couldn't find any items matching your current filters. Try adjusting your search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
