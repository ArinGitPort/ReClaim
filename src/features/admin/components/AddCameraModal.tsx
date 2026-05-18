import { useState, useEffect, useRef } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { Select } from "@/components/ui/Select"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addCameraSchema, type AddCameraFormData } from "@/lib/validations/adminSchemas"

interface AddCameraModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; location: string; sourceUrl: string }) => Promise<void>
}

export function AddCameraModal({ isOpen, onClose, onSubmit }: AddCameraModalProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCameraFormData>({
    resolver: zodResolver(addCameraSchema),
    defaultValues: {
      name: "",
      location: "",
      sourceType: "webcam",
      webcamIndex: "0",
      rtspUrl: "",
    },
  })

  const sourceType = watch("sourceType")
  const webcamIndex = watch("webcamIndex") || "0"

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Fetch available cameras when modal opens
  useEffect(() => {
    if (isOpen && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devs => {
          const videoDevs = devs.filter(d => d.kind === "videoinput")
          setDevices(videoDevs)
        })
        .catch(err => console.warn("Failed to enumerate devices", err))
    }
  }, [isOpen])

  // Stop video stream when modal closes or source changes
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Start video stream
  useEffect(() => {
    if (isOpen && sourceType === "webcam" && devices.length > 0) {
      stopStream()
      
      const index = parseInt(webcamIndex, 10)
      const targetDevice = devices[index] || devices[0]
      
      if (targetDevice) {
        navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: targetDevice.deviceId ? { exact: targetDevice.deviceId } : undefined } 
        })
        .then(stream => {
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(console.warn)
          }
          // If labels are missing, permission was just granted. Fetch devices again to get actual names.
          if (!devices[0]?.label) {
            navigator.mediaDevices.enumerateDevices().then(devs => {
              setDevices(devs.filter(d => d.kind === "videoinput"))
            }).catch(console.warn)
          }
        })
        .catch(err => console.warn("Failed to start preview", err))
      }
    } else {
      stopStream()
    }

    // Stop stream on cleanup
    return () => {
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sourceType, webcamIndex]) // Removed 'devices' from dependencies to prevent infinite loops

  const onFormSubmit = async (data: AddCameraFormData) => {
    const finalSourceUrl = data.sourceType === "webcam" ? (data.webcamIndex || "0") : (data.rtspUrl || "")

    try {
      setSubmitError(null)
      await onSubmit({ name: data.name, location: data.location, sourceUrl: finalSourceUrl })
      reset()
      onClose()
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "userMessage" in err
        ? String((err as { userMessage?: unknown }).userMessage)
        : "Failed to add camera."
      setSubmitError(message)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[800px] max-w-[90vw] bg-white rounded-2xl border border-slate-200 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
      <ModalHeader
        title="Add New Camera"
        icon={<Camera className="w-5 h-5 text-white" />}
        onClose={onClose}
        containerClassName="p-6 pb-4"
        titleClassName="text-slate-900"
      />

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Camera Name</label>
          <input
            {...register("name")}
            placeholder="e.g. Main Entrance"
            className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Location</label>
          <input
            {...register("location")}
            placeholder="e.g. Building A Lobby"
            className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
          />
          {errors.location && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.location.message}</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Source Type</label>
            <Controller
              name="sourceType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                >
                  <option value="webcam">Local Webcam</option>
                  <option value="rtsp">IP Camera / RTSP Stream</option>
                </Select>
              )}
            />
          </div>

          {sourceType === "webcam" ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Webcam Source</label>
              <Controller
                name="webcamIndex"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                  >
                    {devices.length === 0 ? (
                      <option value="0">Camera 0 (Default)</option>
                    ) : (
                      devices.map((d, idx) => (
                        <option key={d.deviceId || idx} value={idx.toString()}>
                          {d.label || `Camera ${idx}`}
                        </option>
                      ))
                    )}
                  </Select>
                )}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stream URL</label>
              <input
                {...register("rtspUrl")}
                placeholder="e.g. rtsp://user:pass@192.168.1.100/stream"
                className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
              />
              {errors.rtspUrl && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.rtspUrl.message}</p>}
            </div>
          )}
          </div>
          </div>

          {/* Right Column: Live Preview Box */}
          <div className="flex flex-col h-full">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Live Preview</label>
            <div className="w-full flex-1 min-h-[240px] bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
              {sourceType === "webcam" ? (
                <>
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover bg-black" 
                    autoPlay
                    muted 
                    playsInline 
                  />
                  {devices.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-100/80">
                      Waiting for camera access...
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center px-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">RTSP Preview Unavailable</div>
                  <div className="text-[10px] text-slate-400 font-medium">Browser security restricts direct RTSP playback. Connection will be verified by the AI daemon upon saving.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {submitError && (
          <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
            {submitError}
          </p>
        )}

        <div className="pt-8 flex justify-end border-t border-slate-100 mt-8">
          <Button 
            disabled={isSubmitting} 
            type="submit" 
            className="h-11 px-8 bg-brand hover:bg-brand-active text-white font-bold rounded-xl border-none shadow-sm transition-all"
          >
            {isSubmitting ? "Saving..." : "Add Camera"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
