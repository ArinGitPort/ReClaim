import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import { getRealtimeSocket } from "@/lib/realtime"
import { Modal } from "./Modal"
import { Button } from "./button"
import { SendHorizonal, User, ShieldAlert, Loader2, X } from "lucide-react"

interface Message {
  id: string
  sender: "STUDENT" | "STAFF" | "ADMIN"
  message: string
  createdAt: string
}

export interface ClaimMessagesProps {
  claimId: string
  onMessageSent?: () => void
  isReadOnly?: boolean;
}

export function ClaimMessages({ claimId, onMessageSent, isReadOnly = false }: ClaimMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (claimId) {
      setLoading(true)
      api.get<{ messages: Message[] }>(`/claims/${claimId}/messages`)
        .then((res) => {
          setMessages(res.data.messages)
        })
        .finally(() => setLoading(false))
    }
  }, [claimId])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket || !claimId) return

    const handleMessage = (data: { claimId: string; messageId: string }) => {
      if (data.claimId === claimId) {
        // Fetch the latest messages instead of trying to reconstruct the message object ourselves
        api.get<{ messages: Message[] }>(`/claims/${claimId}/messages`)
          .then((res) => {
            setMessages(res.data.messages)
          })
          .catch(() => {})
      }
    }

    socket.on("claim.message.created", handleMessage)
    return () => {
      socket.off("claim.message.created", handleMessage)
    }
  }, [claimId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!text.trim()) return

    setSending(true)
    try {
      const res = await api.post<{ message: Message }>(`/claims/${claimId}/messages`, {
        message: text.trim(),
      })
      setMessages((prev) => [...prev, res.data.message])
      setText("")
      if (onMessageSent) {
        onMessageSent()
      }
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
      {/* Messages Area */}
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
              <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs">Messages sent between you and the admin will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => {
              const isAdmin = m.sender === "ADMIN" || m.sender === "STAFF"
              return (
                <div key={m.id} className={`flex gap-3 max-w-[85%] ${isAdmin ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 shadow-sm ${isAdmin ? "bg-amber-100" : "bg-brand/10 border border-brand/20"}`}>
                    {isAdmin ? <ShieldAlert className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-brand" />}
                  </div>
                  <div className={`flex flex-col gap-1.5 ${isAdmin ? "items-start" : "items-end"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{isAdmin ? 'Admin' : 'You'}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`text-sm px-4 py-3 rounded-2xl ${isAdmin ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm" : "bg-brand text-white rounded-tr-sm shadow-md"}`}>
                      {m.message}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        {isReadOnly ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <p className="text-sm font-bold text-slate-500">Messaging is restricted</p>
            <p className="text-xs font-semibold text-slate-400">You can only send messages when an inquiry is actively requested.</p>
          </div>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSend()
              }}
              className="flex gap-3 relative"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white resize-none transition-all placeholder:text-slate-400"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
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
            <p className="text-[10px] text-center font-semibold text-slate-400 mt-3 flex items-center justify-center gap-1">
              Press <span className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 shadow-sm">Enter</span> to send.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

interface ClaimMessagesModalProps {
  claimId: string
  isOpen: boolean
  onClose: () => void
  onMessageSent?: () => void
  isReadOnly?: boolean;
}

export function ClaimMessagesModal({ claimId, isOpen, onClose, onMessageSent, isReadOnly = false }: ClaimMessagesModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl flex flex-col pt-0 pb-0 overflow-hidden h-[600px] bg-slate-50 p-0">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Claim Communication</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Discuss details or provide proof</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ClaimMessages claimId={claimId} onMessageSent={onMessageSent} isReadOnly={isReadOnly} />
      </div>
    </Modal>
  )
}