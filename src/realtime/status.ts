export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting'

let status: RealtimeStatus = 'idle'
const listeners = new Set<() => void>()

export const realtimeStatusStore = {
  get: () => status,
  set(next: RealtimeStatus) {
    if (status === next) return
    status = next
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
