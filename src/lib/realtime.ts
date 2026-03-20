// Mock Realtime Implementation
export function getRealtimeSocket() {
  console.log("[MOCK REALTIME] Socket requested");
  return {
    on: (event: string, _cb: any) => {
      console.log(`[MOCK REALTIME] Subscribed to ${event}`);
      // Special case for mock item updates
      if (event === "item.updated") {
        // We could trigger mock updates here if needed
      }
    },
    off: (event: string, _cb: any) => console.log(`[MOCK REALTIME] Unsubscribed from ${event}`),
    emit: (event: string, data: any) => console.log(`[MOCK REALTIME] Emitted ${event}`, data),
    disconnect: () => console.log("[MOCK REALTIME] Disconnected"),
    connected: true,
  };
}

export function disconnectRealtimeSocket() {
  console.log("[MOCK REALTIME] Global disconnect");
}
