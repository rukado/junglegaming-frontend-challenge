import { useSyncExternalStore } from 'react'
import { readString, removeKey, storageKeys, writeString } from '@/lib/storage'

export type SessionEndReason = 'logout' | 'expired'

export type SessionSnapshot = {
  token: string | null
  endedReason: SessionEndReason | null
}

type Listener = () => void

let snapshot: SessionSnapshot = { token: readString(storageKeys.sessionToken), endedReason: null }
const listeners = new Set<Listener>()
const endListeners = new Set<(reason: SessionEndReason) => void>()

function emit(next: SessionSnapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

export const sessionStore = {
  getSnapshot: () => snapshot,
  getToken: () => snapshot.token,
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  onSessionEnd(listener: (reason: SessionEndReason) => void) {
    endListeners.add(listener)
    return () => endListeners.delete(listener)
  },
  start(token: string) {
    writeString(storageKeys.sessionToken, token)
    emit({ token, endedReason: null })
  },
  end(reason: SessionEndReason) {
    if (snapshot.token === null && snapshot.endedReason === reason) return
    removeKey(storageKeys.sessionToken)
    emit({ token: null, endedReason: reason })
    endListeners.forEach((listener) => listener(reason))
  },
  acknowledgeEnd() {
    if (snapshot.endedReason === null) return
    emit({ ...snapshot, endedReason: null })
  },
  syncFromStorage() {
    const token = readString(storageKeys.sessionToken)
    if (token !== snapshot.token) emit({ token, endedReason: null })
  },
}

export function useSessionSnapshot() {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getSnapshot,
  )
}
