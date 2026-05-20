import { useEffect, useRef, useState } from "react"
import { Loader2, MessageSquare, SendHorizonal, ShieldAlert, User } from "lucide-react"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { markReportMessagesViewed } from "@/lib/reportMessageReadState"
import { Button } from "./button"
import { Modal } from "./Modal"
import { ModalHeader } from "./ModalHeader"

type Message = {
  id: string
  sender: "STUDENT" | "STAFF" | "ADMIN"
  message: string
  createdAt: string
}

type ReportMessagesProps = {
  reportId: string
  onMessageSent?: () => void
  onViewed?: () => void
  isReadOnly?: boolean
}

export function ReportMessages({ reportId, onMessageSent, onViewed, isReadOnly = false }: ReportMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const onViewedRef = useRef(onViewed)

  useEffect(() => {
    onViewedRef.current = onViewed
  }, [onViewed])

  useEffect(() => {
    if (!reportId) return

    setLoading(true)
    api.get<{ messages: Message[] }>(`/reports/${reportId}/messages`)
      .then((res) => {
        setMessages(res.data.messages)
        markReportMessagesViewed(reportId)
        onViewedRef.current?.()
      })
      .finally(() => setLoading(false))
  }, [reportId])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket || !reportId) return

    const handleMessage = (data: { reportId: string }) => {
      if (data.reportId !== reportId) return

      api.get<{ messages: Message[] }>(`/reports/${reportId}/messages`)
        .then((res) => {
          setMessages(res.data.messages)
          markReportMessagesViewed(reportId)
          onViewedRef.current?.()
        })
        .catch(() => {})
    }

    socket.on("report.message.created", handleMessage)
    return () => {
      socket.off("report.message.created", handleMessage)
    }
  }, [reportId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!text.trim()) return

    setSending(true)
    try {
      const res = await api.post<{ message: Message }>(`/reports/${reportId}/messages`, {
        message: text.trim(),
      })
      setMessages((prev) => [...prev, res.data.message])
      setText("")
      onMessageSent?.()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 min-h-[250px] max-h-[400px]" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[150px]">
            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full min-h-[150px] text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">No messages yet</p>
              <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs">Messages between the student and campus office will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message) => {
              const isAdmin = message.sender === "ADMIN" || message.sender === "STAFF"
              return (
                <div key={message.id} className={`flex gap-3 max-w-[85%] ${isAdmin ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 shadow-sm ${isAdmin ? "bg-amber-100" : "bg-brand/10 border border-brand/20"}`}>
                    {isAdmin ? <ShieldAlert className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-brand" />}
                  </div>
                  <div className={`flex flex-col gap-1.5 ${isAdmin ? "items-start" : "items-end"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{isAdmin ? "Admin" : "Student"}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className={`text-sm px-4 py-3 rounded-2xl ${isAdmin ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm" : "bg-brand text-white rounded-tr-sm shadow-md"}`}>
                      {message.message}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        {isReadOnly ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-slate-500">Messaging is unavailable</p>
            <p className="text-xs font-semibold text-slate-400">Report messages open after the report is authorized.</p>
          </div>
        ) : (
          <>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleSend()
              }}
              className="flex gap-3 relative"
            >
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={sending}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white resize-none transition-all placeholder:text-slate-400"
                rows={2}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void handleSend()
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!text.trim() || sending}
                className="absolute right-2 top-2 bottom-2 rounded-lg bg-brand hover:bg-brand/90 text-white shadow-sm flex items-center justify-center p-2 mb-1 h-9 mt-1"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
              </Button>
            </form>
            <p className="text-[10px] text-center font-semibold text-slate-400 mt-3">
              Press <span className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 shadow-sm">Enter</span> to send.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

type ReportMessagesModalProps = {
  reportId: string
  isOpen: boolean
  onClose: () => void
  onMessageSent?: () => void
  onViewed?: () => void
  isReadOnly?: boolean
}

export function ReportMessagesModal({ reportId, isOpen, onClose, onMessageSent, onViewed, isReadOnly = false }: ReportMessagesModalProps) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl flex flex-col pt-0 pb-0 overflow-hidden h-[600px] bg-slate-50 p-0">
      <ModalHeader
        title="Report Messages"
        subtitle="Coordinate report details and matching follow-up"
        icon={<MessageSquare className="w-5 h-5 text-white" />}
        onClose={onClose}
        containerClassName="p-5 bg-white shrink-0"
        titleClassName="text-slate-900"
      />
      <div className="flex-1 overflow-hidden">
        <ReportMessages reportId={reportId} onMessageSent={onMessageSent} onViewed={onViewed} isReadOnly={isReadOnly} />
      </div>
    </Modal>
  )
}
