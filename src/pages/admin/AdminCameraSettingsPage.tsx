import { useState, useEffect } from "react"
import { Video, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/Switch"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { AdminListFilters, AdminListHeader, AdminSearchInput, AdminTableContainer } from "@/features/admin/components/admin-list-layout"
import { AddCameraModal } from "@/features/admin/components/AddCameraModal"
import { api } from "@/lib/api"

type CampusCamera = {
  id: string
  code: string
  name: string
  location: string
  sourceUrl: string
  isOnline: boolean
  aiEnabled: boolean
  lastPingAtUtc: string | null
}

export function CameraSettingsPage() {
  const [cameras, setCameras] = useState<CampusCamera[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [, setIsLoading] = useState(true)
  const [cameraToDelete, setCameraToDelete] = useState<CampusCamera | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const loadCameras = async () => {
    try {
      const response = await api.get<{ cameras: CampusCamera[] }>("/cameras")
      setCameras(response.data.cameras)
    } catch {
      alert("Failed to load cameras")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCameras()
  }, [])

  const filteredCameras = cameras.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleAi = async (id: string, newAiState: boolean) => {
    try {
      setCameras(prev => prev.map(c => c.id === id ? { ...c, aiEnabled: newAiState } : c))
      await api.patch(`/cameras/${id}/ai`, { aiEnabled: newAiState })
    } catch {
      alert("Failed to update AI state")
      setCameras(prev => prev.map(c => c.id === id ? { ...c, aiEnabled: !newAiState } : c))
    }
  }

  const handleAddCamera = async (data: { name: string; location: string; sourceUrl: string }) => {
    const response = await api.post<{ camera: CampusCamera }>("/cameras", data)
    setCameras(prev => [...prev, response.data.camera])
    setIsAddModalOpen(false)
  }

  const confirmDeleteCamera = async () => {
    if (!cameraToDelete) return
    setIsDeleting(true)
    try {
      await api.delete(`/cameras/${cameraToDelete.id}`)
      setCameras(prev => prev.filter(c => c.id !== cameraToDelete.id))
      setCameraToDelete(null)
    } catch {
      alert("Failed to delete camera")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatLastPing = (utcStr: string | null) => {
    if (!utcStr) return "Never pinged"
    const diffSeconds = Math.floor((Date.now() - new Date(utcStr).getTime()) / 1000)
    if (diffSeconds < 60) return `Active ${diffSeconds}s ago`
    const diffMins = Math.floor(diffSeconds / 60)
    if (diffMins < 60) return `Active ${diffMins}m ago`
    return `Offline for ${Math.floor(diffMins / 60)}h`
  }

  return (
    <div className="space-y-8">
      <AdminListHeader
        title="Camera Settings"
        description="Manage physical camera units and AI detection model settings."
        actions={(
          <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-initial h-10 px-4 bg-brand hover:bg-brand-active text-white font-bold rounded-xl shadow-sm border-none">
            <Plus className="w-4 h-4 mr-2" />
            Add New Camera
          </Button>
        )}
      />

      <div className="space-y-3">
        <AdminListFilters>
          <AdminSearchInput
            placeholder="Search by camera name, ID, or location..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </AdminListFilters>

        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:text-right">
          Showing {filteredCameras.length} camera{filteredCameras.length === 1 ? "" : "s"}
        </p>
      </div>

      <AdminTableContainer>
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest font-bold text-[10px] text-slate-700">
            <tr>
              <th className="px-8 py-5">Camera details</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">AI Detection</th>
              <th className="px-8 py-5">Last Ping</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCameras.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500">No cameras found.</td>
              </tr>
            ) : (
              filteredCameras.map((camera) => (
                <tr key={camera.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Video className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {camera.name}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">{camera.code}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          {camera.location} &bull; {camera.sourceUrl}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      camera.isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${camera.isOnline ? 'bg-green-500' : 'bg-rose-500'}`} />
                      {camera.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={camera.aiEnabled}
                        onCheckedChange={(val) => toggleAi(camera.id, val)}
                        disabled={!camera.isOnline}
                      />
                      <span className={`text-xs font-bold leading-none ${!camera.isOnline ? 'text-slate-300' : camera.aiEnabled ? 'text-slate-700' : 'text-slate-400'}`}>
                        {camera.aiEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`text-sm font-semibold ${camera.isOnline ? 'text-slate-600' : 'text-rose-600'}`}>
                      {formatLastPing(camera.lastPingAtUtc)}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCameraToDelete(camera)}
                      className="h-8 border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 text-[10px] font-bold uppercase tracking-widest text-rose-600"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableContainer>

      <AddCameraModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddCamera} 
      />

      <ConfirmModal
        isOpen={!!cameraToDelete}
        onClose={() => !isDeleting && setCameraToDelete(null)}
        onConfirm={confirmDeleteCamera}
        title="Delete Camera"
        message={`Are you sure you want to delete ${cameraToDelete?.name}? This action cannot be undone and will stop AI detection for this location.`}
        confirmText="Delete Camera"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  )
}
