import { useState, useEffect, useMemo } from "react"
import { Camera, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { Select } from "@/components/ui/Select"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "@/lib/api"
import { AI_SERVICE_BASE_URL } from "@/lib/constants"
import { addCameraSchema, type AddCameraFormData } from "@/lib/validations/adminSchemas"

interface AddCameraModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; location: string; sourceUrl: string; aiConfThreshold?: number; aiFrameSkip?: number }) => Promise<void>
  initialValues?: {
    name: string
    location: string
    sourceUrl: string
    aiConfThreshold?: number
    aiFrameSkip?: number
  } | null
  title?: string
  submitText?: string
}

type CameraSourceOption = {
  sourceUrl: string
  label: string
  available: boolean
  active?: boolean
  width?: number | null
  height?: number | null
}

export function AddCameraModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title = "Add New Camera",
  submitText = "Add Camera",
}: AddCameraModalProps) {
  const defaultValues = useMemo(() => getDefaultValues(initialValues), [initialValues])
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddCameraFormData>({
    resolver: zodResolver(addCameraSchema),
    defaultValues,
  })

  const sourceType = useWatch({ control, name: "sourceType" })
  const webcamIndex = useWatch({ control, name: "webcamIndex" }) || "0"
  const aiConfThreshold = useWatch({ control, name: "aiConfThreshold" }) ?? 0.35
  const aiFrameSkip = useWatch({ control, name: "aiFrameSkip" }) ?? 6

  const [cameraSources, setCameraSources] = useState<CameraSourceOption[]>([])
  const [isDetectingSources, setIsDetectingSources] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [isPreviewActive, setIsPreviewActive] = useState(false)
  const [previewSession, setPreviewSession] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleClose = () => {
    stopPreview()
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return
    reset(defaultValues)
    setSubmitError(null)
  }, [defaultValues, isOpen, reset])

  useEffect(() => {
    setPreviewError(false)
    setIsPreviewActive(false)
  }, [webcamIndex, sourceType])

  useEffect(() => {
    if (!isOpen) setIsPreviewActive(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || sourceType !== "webcam" || cameraSources.length === 0) return

    const preferredSource = (
      cameraSources.find((source) => source.active)
      ?? cameraSources.find((source) => source.available && source.sourceUrl !== "0")
      ?? cameraSources.find((source) => source.available)
    )

    if (preferredSource && preferredSource.sourceUrl !== webcamIndex) {
      setValue("webcamIndex", preferredSource.sourceUrl, { shouldDirty: true, shouldValidate: true })
    }
  }, [cameraSources, isOpen, setValue, sourceType, webcamIndex])

  const startPreview = () => {
    setPreviewError(false)
    setPreviewSession((current) => current + 1)
    setIsPreviewActive(true)
  }

  const stopPreview = () => {
    setIsPreviewActive(false)
    setPreviewSession((current) => current + 1)
  }

  const detectCameraSources = async () => {
    setIsDetectingSources(true)
    setSubmitError(null)
    try {
      const response = await api.get<{ sources: CameraSourceOption[] }>("/cameras/sources")
      setCameraSources(response.data.sources)
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "userMessage" in err
        ? String((err as { userMessage?: unknown }).userMessage)
        : "Unable to detect camera sources. Start the camera service and try again."
      setSubmitError(message)
    } finally {
      setIsDetectingSources(false)
    }
  }

  const onFormSubmit = async (data: AddCameraFormData) => {
    const finalSourceUrl = data.sourceType === "webcam" ? (data.webcamIndex || "0") : (data.rtspUrl || "")

    try {
      setSubmitError(null)
      stopPreview()
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      await onSubmit({ 
        name: data.name, 
        location: data.location, 
        sourceUrl: finalSourceUrl,
        aiConfThreshold: data.aiConfThreshold,
        aiFrameSkip: data.aiFrameSkip,
      })
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
    <Modal isOpen={isOpen} onClose={handleClose} className="w-[960px] max-w-[95vw] bg-white rounded-2xl border border-slate-200 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
      <ModalHeader
        title={title}
        icon={<Camera className="w-5 h-5 text-white" />}
        onClose={handleClose}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Python Service Source</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void detectCameraSources()}
                  disabled={isDetectingSources}
                  className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-black uppercase tracking-widest text-slate-600"
                >
                  <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isDetectingSources ? "animate-spin" : ""}`} />
                  Detect
                </Button>
              </div>
              <Controller
                name="webcamIndex"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                  >
                    {getSourceOptions(cameraSources, webcamIndex).map((source) => (
                      <option key={source.sourceUrl} value={source.sourceUrl}>
                        {source.label}{source.active ? " - active" : source.available ? ` - available${source.width && source.height ? ` (${source.width}x${source.height})` : ""}` : " - unavailable"}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <p className="text-[10px] font-semibold leading-relaxed text-slate-400">
                These are indexes tested by the Python camera service. Browser camera order can differ from service order.
              </p>
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

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">AI Detection Settings</h4>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Confidence Threshold</label>
                  <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">{Math.round(aiConfThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  {...register("aiConfThreshold", { valueAsNumber: true })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                />
                <p className="mt-2 text-[10px] font-medium text-slate-400 leading-snug">Higher confidence reduces false positives but might miss items. Default: 35%.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Frame Skip (Performance)</label>
                  <span className="text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded">1 in {aiFrameSkip} frames</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  {...register("aiFrameSkip", { valueAsNumber: true })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                />
                <p className="mt-2 text-[10px] font-medium text-slate-400 leading-snug">Process fewer frames to save GPU load. E.g., 6 processes ~5 FPS. Default: 6.</p>
              </div>
            </div>
          </div>
          </div>
          </div>

          {/* Right Column: Live Preview Box */}
          <div className="flex flex-col">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Source Verification</label>
            <div className="w-full aspect-video bg-slate-900 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
              {sourceType === "webcam" ? (
                <>
                  {isPreviewActive && !previewError ? (
                    <img
                      src={`${AI_SERVICE_BASE_URL}/preview-source?source=${encodeURIComponent(webcamIndex)}&session=${previewSession}`}
                      alt={`Preview for local camera ${webcamIndex}`}
                      className="h-full w-full object-contain"
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <div className="px-8 text-center">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                        {previewError ? "Preview Unavailable" : "Preview Paused"}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Click Start Preview to view the selected Python camera source. Preview is released before saving so Live Monitor can own the USB camera.
                      </div>
                      <Button
                        type="button"
                        onClick={startPreview}
                        className="mt-5 h-9 rounded-lg bg-brand px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-active"
                      >
                        Start Preview
                      </Button>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                    Source {webcamIndex}
                  </div>
                  {isPreviewActive && (
                    <Button
                      type="button"
                      onClick={stopPreview}
                      className="absolute right-3 top-3 h-8 rounded-lg bg-white/95 px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm hover:bg-white"
                    >
                      Stop Preview
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center px-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">RTSP Preview Unavailable</div>
                  <div className="text-[10px] text-slate-400 font-medium">Browser security restricts direct RTSP playback. Connection will be verified by the camera service upon saving.</div>
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
            {isSubmitting ? "Saving..." : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function getSourceOptions(sources: CameraSourceOption[], currentValue: string): CameraSourceOption[] {
  const fallbackSources: CameraSourceOption[] = ["0", "1", "2", "3"].map((sourceUrl) => ({
    sourceUrl,
    label: `Local camera ${sourceUrl}`,
    available: sourceUrl === currentValue,
  }))
  const options = sources.length > 0 ? sources : fallbackSources
  if (options.some((source) => source.sourceUrl === currentValue)) return options

  return [
    { sourceUrl: currentValue, label: `Current source ${currentValue}`, available: true },
    ...options,
  ]
}

function getDefaultValues(initialValues?: AddCameraModalProps["initialValues"]): AddCameraFormData {
  const sourceUrl = initialValues?.sourceUrl ?? "0"
  const isRtsp = sourceUrl.startsWith("rtsp://")

  return {
    name: initialValues?.name ?? "",
    location: initialValues?.location ?? "",
    sourceType: isRtsp ? "rtsp" : "webcam",
    webcamIndex: isRtsp ? "0" : sourceUrl,
    rtspUrl: isRtsp ? sourceUrl : "",
    aiConfThreshold: initialValues?.aiConfThreshold ?? 0.35,
    aiFrameSkip: initialValues?.aiFrameSkip ?? 6,
  }
}
