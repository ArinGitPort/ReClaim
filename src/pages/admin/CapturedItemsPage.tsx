import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { CapturedItem } from "@/data/mockData"
import { Inbox, Clock, Bot, CheckCircle, ArrowRight, Camera as CameraIcon } from "lucide-react"
import { ReviewItemModal } from "../../components/admin/ReviewItemModal"
import { SmartSnapCamera } from "../../components/admin/SmartSnapCamera"

export function CapturedItemsPage() {
  const [items, setItems] = useState<CapturedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<CapturedItem | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const loadCapturedItems = async () => {
    setIsLoading(true)
    try {
      const response = await api.get<CapturedItem[]>("/admin/captured-items")
      setItems(response.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCapturedItems()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Captured Items Inbox</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Review items automatically detected by AI cameras.</p>
        </div>
        <button 
          onClick={() => setShowCamera(!showCamera)}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all active:scale-95"
        >
          {showCamera ? <Inbox className="w-5 h-5" /> : <CameraIcon className="w-5 h-5" />}
          {showCamera ? "View Inbox" : "Live AI Camera"}
        </button>
      </div>

      {showCamera ? (
        <SmartSnapCamera onCapture={loadCapturedItems} />
      ) : (
        <>
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing with AI Nodes...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl p-24 border border-slate-200 border-dashed text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-800">Inbox is Clear</h3>
               <p className="text-slate-400 font-medium mt-2">No new items have been captured recently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-brand/10 hover:border-brand/30 transition-all cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    <img src={item.imageUrl} alt="Captured Item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className="px-3 py-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-full text-[10px] font-bold text-brand flex items-center gap-1 uppercase tracking-tight">
                         <Bot className="w-3 h-3" />
                         AI Guess: {item.aiPrediction}
                       </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3 text-slate-400">
                      <div className="flex items-center gap-1.5 ">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.confidence * 100}% Fit</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-4">Detected at {item.suggestedLocation}</h4>
                    <button className="w-full py-2.5 bg-slate-50 group-hover:bg-brand group-hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                      Review & Publish
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedItem && (
        <ReviewItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onPublish={() => {
            setSelectedItem(null)
            loadCapturedItems()
          }}
        />
      )}
    </div>
  )
}
