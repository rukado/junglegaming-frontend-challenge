import { io, type Socket } from 'socket.io-client'
import { env } from '@/env'
import { sessionStore } from '@/features/auth/session-store'
import { realtimeStatusStore } from './status'

let socket: Socket | null = null
const setStatus = realtimeStatusStore.set

export function getSocket(): Socket {
  if (socket) return socket
  socket = io(env.VITE_SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: false,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
    timeout: 5_000,
    auth: (callback) => callback({ token: sessionStore.getToken() }),
  })
  socket.on('connect', () => setStatus('connected'))
  socket.on('disconnect', () => setStatus(socket?.active ? 'reconnecting' : 'idle'))
  socket.on('connect_error', () => setStatus(socket?.active ? 'reconnecting' : 'idle'))
  return socket
}

export function connectRealtime() {
  const current = getSocket()
  if (current.connected || current.active) return
  setStatus('connecting')
  current.connect()
}

export function reconnectRealtime() {
  const current = getSocket()
  current.disconnect()
  setStatus('connecting')
  current.connect()
}

export function disconnectRealtime() {
  socket?.disconnect()
  setStatus('idle')
}
