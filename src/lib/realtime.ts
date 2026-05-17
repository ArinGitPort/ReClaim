import { io, type Socket } from "socket.io-client"
import { getStoredToken } from "@/lib/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"

function getRealtimeBaseUrl(): string {
  return API_BASE_URL.endsWith("/api")
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL
}

let socketInstance: Socket | null = null

export function getRealtimeSocket(): Socket | null {
  const token = getStoredToken()
  if (!token) {
    return null
  }

  if (!socketInstance) {
    socketInstance = io(getRealtimeBaseUrl(), {
      transports: ["websocket", "polling"],
      autoConnect: true,
      auth: { token },
    })

    socketInstance.on("connect_error", () => {
      // Keep UI functional even if websocket connection fails.
    })
  }

  if (typeof socketInstance.auth === "function") {
    socketInstance.auth = { token }
  } else {
    socketInstance.auth = { ...(socketInstance.auth ?? {}), token }
  }

  if (!socketInstance.connected) {
    socketInstance.connect()
  }

  return socketInstance
}

export function disconnectRealtimeSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
