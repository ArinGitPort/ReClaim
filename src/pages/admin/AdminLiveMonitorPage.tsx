import { useState, useEffect } from "react"
import { Activity, Radio, Expand, BellDot, LayoutGrid, MonitorPlay } from "lucide-react"
import { AdminListHeader } from "@/features/admin/components/admin-list-layout"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/button"

// Simulated mock data for recent detections
const MOCK_RECENT_DETECTIONS = [
  { id: 1, time: "10:42 AM", location: "Cafeteria Entry", category: "Electronics", conf: "92%" },
  { id: 2, time: "10:38 AM", location: "Main Entrance", category: "Bag/Backpack", conf: "88%" },
  { id: 3, time: "10:15 AM", location: "Gymnasium", category: "Water Bottle", conf: "95%" },
  { id: 4, time: "09:50 AM", location: "Main Library", category: "Keys", conf: "78%" },
  { id: 5, time: "09:12 AM", location: "Cafeteria Entry", category: "Wallet", conf: "99%" },
  { id: 6, time: "08:45 AM", location: "Main Library", category: "Electronics", conf: "84%" }
]

const CAMERAS = [
  { id: "CAM-01", location: "Main Entrance", status: "LIVE" },
  { id: "CAM-02", location: "Main Library", status: "LIVE" },
  { id: "CAM-03", location: "Cafeteria Entry", status: "LIVE" },
  { id: "CAM-04", location: "Gym Doors", status: "LIVE" },
  { id: "CAM-05", location: "Tech Lab", status: "IDLE" },
  { id: "CAM-06", location: "Staff Room Area", status: "LIVE" },
]

export function LiveMonitorPage() {
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "focus">("grid")
  const [activeCamId, setActiveCamId] = useState(CAMERAS[0].id)
  
  // Real-time clock for the mock monitor
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  const activeCam = CAMERAS.find(c => c.id === activeCamId) || CAMERAS[0]

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <AdminListHeader
        title="Live AI Monitor"
        description="Real-time multi-camera detection feed and analysis."
        actions={(
          <div className="flex items-center gap-3">
            <Select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 w-40 text-xs font-semibold"
            >
              <option value="all">All Buildings</option>
              <option value="library">Main Library</option>
              <option value="cafeteria">Cafeteria</option>
            </Select>

            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Monitoring
            </div>
          </div>
        )}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Main Video Section */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          
          {/* View Customization Header */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2 sm:p-3 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:inline-block">Layout:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode("focus")} 
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'focus' ? 'bg-white shadow-sm text-brand' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Single Camera Focus"
                >
                  <MonitorPlay className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("grid")} 
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-[10px] font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest flex items-center gap-2">
               <span>SYS_TIME: {time}</span>
            </div>
          </div>

          {/* Video Grid Container */}
          <div className="flex-1 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            {viewMode === "grid" ? (
              // FULL GRID VIEW
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 h-full content-start">
                {CAMERAS.map((cam, idx) => (
                  <CameraFeed 
                    key={cam.id} 
                    cam={cam} 
                    idx={idx} 
                    time={time} 
                    onClick={() => { setActiveCamId(cam.id); setViewMode("focus") }} 
                  />
                ))}
              </div>
            ) : (
              // FOCUS VIEW (1 Large, Thumbnails below)
              <div className="flex flex-col h-full gap-3 relative">
                 <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <CameraFeed cam={activeCam} idx={0} time={time} isFocus />
                 </div>
                 <div className="flex gap-2.5 overflow-x-auto pb-1 flex-shrink-0 h-24 sm:h-32">
                    {CAMERAS.map((cam, idx) => (
                      <div 
                        key={cam.id} 
                        onClick={() => setActiveCamId(cam.id)}
                        className={`w-32 sm:w-48 flex-shrink-0 relative cursor-pointer border-2 transition-all rounded-lg overflow-hidden ${activeCamId === cam.id ? 'border-brand' : 'border-transparent hover:border-slate-300'}`}
                      >
                         <CameraFeed cam={cam} idx={idx} time={time} />
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Alert Feed */}
        <div className="w-full lg:w-80 flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-shrink-0 max-h-[300px] lg:max-h-full">
          <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" />
              Recent Detections
            </h3>
            <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {MOCK_RECENT_DETECTIONS.map(alert => (
              <div key={alert.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-brand/30 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{alert.time}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{alert.conf}</span>
                </div>
                <div className="font-bold text-slate-700 text-sm group-hover:text-brand transition-colors">
                  {alert.category} Detected
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                   <BellDot className="w-3 h-3 text-slate-400" />
                   {alert.location}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white border-t border-slate-200">
             <Button className="w-full h-9 bg-brand hover:bg-brand-active text-white font-bold text-xs uppercase tracking-widest shadow-sm">
               View All Logs
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CameraFeed({ cam, idx, time, isFocus, onClick }: { cam: any, idx: number, time: string, isFocus?: boolean, onClick?: () => void }) {
  return (
    <div 
      className={`group w-full h-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Simulated Raw Video Stream Background */}
      <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-800 font-mono text-sm">
        <Radio className="w-8 h-8 mb-2 opacity-50" />
        <span className={isFocus ? 'text-lg' : 'text-xs'}>STREAM_CONN_OK</span>
      </div>
      
      {/* Simulated AI Overlays */}
      {cam.status === "LIVE" && idx % 2 === 0 && (
        <div className="absolute top-[20%] left-[30%] w-[35%] h-[45%] border-2 border-brand/80 bg-brand/5 pointer-events-none transition-all">
          <div className="absolute -top-5 left-[-2px] bg-brand/90 text-white text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap uppercase tracking-wider">
            {idx === 0 ? "BACKPACK 92%" : "ELECTRONICS 88%"}
          </div>
        </div>
      )}

      {/* Hardware OSD (On-Screen Display) */}
      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
            {cam.status === "LIVE" ? (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[pulse_2s_ease-in-out_infinite]" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            )}
            {cam.id} {!onClick && `- ${cam.location}`}
          </div>
        </div>
        
        {/* Only show time on main grid or focus viewport to avoid clutter on thumbnails */}
        {(!onClick || isFocus) && (
          <div className="hidden sm:block bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-white/90">
            {time}
          </div>
        )}
      </div>

      {/* Hover Quick Actions */}
      {onClick && !isFocus && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
           <Expand className="w-8 h-8 text-white/80" />
        </div>
      )}
    </div>
  )
}
