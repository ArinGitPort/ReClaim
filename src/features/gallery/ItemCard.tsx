import { useState } from "react"
import { ShieldAlert, Laptop, MapPin, CalendarClock } from "lucide-react"
import { BlindVerificationModal } from "@/features/claims/BlindVerificationModal"

// Ensure we have our shared types in place (will create types/index.ts later)
export interface FoundItem {
  id: string
  title: string
  category: string
  location: string
  dateLost: string
  isHighValue: boolean
  imageUrl?: string
}

interface ItemCardProps {
  item: FoundItem
}

export function ItemCard({ item }: ItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
        {/* Visual Header */}
        <div className="h-48 w-full bg-slate-50 border-b border-slate-200 flex items-center justify-center relative overflow-hidden">
          {item.isHighValue ? (
            <div className="flex flex-col items-center justify-center text-slate-500 opacity-70 group-hover:scale-105 transition-transform duration-500">
              <Laptop className="w-16 h-16 mb-2" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">Secure Match required</span>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500">
              {/* Placeholder for actual low-value image */}
              <span className="text-xs font-medium">No Image Provided</span>
            </div>
          )}
          
          {/* High Value Badge overlay */}
          {item.isHighValue && (
            <div className="absolute top-3 left-3 bg-brand/10 backdrop-blur-md border border-brand/20 px-2.5 py-1 rounded text-[10px] font-bold text-brand flex items-center gap-1.5 shadow-sm">
              <ShieldAlert className="w-3 h-3" />
              HIGH VALUE
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1 group-hover:text-[#263DA8] transition-colors">
              {item.title}
            </h3>
          </div>
          
          <div className="space-y-2 mt-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4 text-[#263DA8]/70" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarClock className="w-4 h-4 text-[#263DA8]/70" />
              <span>{new Date(item.dateLost).toLocaleDateString()}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-auto w-full py-2.5 bg-[#263DA8] hover:bg-[#203794] text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            Claim This Item
          </button>
        </div>
      </div>

      <BlindVerificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        itemId={item.id}
        itemTitle={item.title}
      />
    </>
  )
}
