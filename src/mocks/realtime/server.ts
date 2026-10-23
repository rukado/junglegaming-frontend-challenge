import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import type { NftDetail, NftUpdatedEvent, OrderUpdatedEvent, RealtimeEvent } from '@/api/contracts'
import { socketWsUrl } from '../config'
import { getDb, mutate } from '../db/store'
import type { OrderRecord } from '../db/types'
import { getScenario } from '../scenarios'

type SocketIo = ReturnType<typeof toSocketIo>

type Connection = {
  id: string
  userId: string | null
  io: SocketIo
  close: () => void
}

const connections = new Map<string, Connection>()
const heartbeatMs = 20_000
const listeners = new Set<() => void>()
let connectionSeq = 0
let forcedOffline = false
const emitted: RealtimeEvent[] = []

export function setSocketOffline(offline: boolean) {
  forcedOffline = offline
  if (offline) dropAllConnections()
}

export function getEmittedEvents() {
  return [...emitted]
}

export const realtimeLink = ws.link(socketWsUrl)

function notify() {
  listeners.forEach((listener) => listener())
}

export function subscribeConnections(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function listConnections() {
  return Array.from(connections.values(), ({ id, userId }) => ({ id, userId }))
}

function userIdForToken(token: unknown): string | null {
  if (typeof token !== 'string') return null
  const session = getDb().sessions.find((candidate) => candidate.token === token)
  if (!session || session.expiresAt <= Date.now()) return null
  return session.userId
}

function parseConnectAuth(data: unknown): Record<string, unknown> | null {
  if (typeof data !== 'string' || !data.startsWith('40')) return null
  const payload = data.slice(2)
  if (!payload) return {}
  try {
    const parsed: unknown = JSON.parse(payload)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export const realtimeHandler = realtimeLink.addEventListener('connection', (connection) => {
  if (forcedOffline || getScenario().socketOffline) {
    setTimeout(() => connection.client.close(1011, 'unavailable'), 0)
    return
  }
  connectionSeq += 1
  const id = `sock_${connectionSeq}`
  const io = toSocketIo(connection)
  const entry: Connection = {
    id,
    userId: null,
    io,
    close: () => connection.client.close(1012, 'restart'),
  }
  connections.set(id, entry)
  notify()

  connection.client.addEventListener('message', (event) => {
    const auth = parseConnectAuth(event.data)
    if (auth) {
      entry.userId = userIdForToken(auth.token)
      notify()
    }
  })

  const heartbeat = setInterval(() => connection.client.send('2'), heartbeatMs)

  connection.client.addEventListener('close', () => {
    clearInterval(heartbeat)
    connections.delete(id)
    notify()
  })
})

function nextEventId() {
  return mutate((db) => {
    db.eventSeq += 1
    return `evt_${String(db.eventSeq).padStart(6, '0')}`
  })
}

export function buildNftUpdatedEvent(nft: NftDetail): NftUpdatedEvent {
  return {
    id: nextEventId(),
    type: 'nft.updated',
    resource: { type: 'nft', id: nft.id },
    version: nft.version,
    occurredAt: new Date().toISOString(),
    data: {
      priceEth: nft.priceEth,
      available: nft.available,
      editions: nft.editions.map(({ id, priceEth, available }) => ({ id, priceEth, available })),
    },
  }
}

export function buildOrderUpdatedEvent(order: OrderRecord): OrderUpdatedEvent {
  return {
    id: nextEventId(),
    type: 'order.updated',
    resource: { type: 'order', id: order.id },
    userId: order.userId,
    version: order.version,
    occurredAt: new Date().toISOString(),
    data: {
      status: order.status,
      txHash: order.txHash,
      explorerUrl: order.explorerUrl,
      rejectionReason: order.rejectionReason,
      settledAt: order.settledAt,
    },
  }
}

export function emitEvent(event: RealtimeEvent) {
  emitted.push(event)
  if (emitted.length > 200) emitted.shift()
  connections.forEach((connection) => {
    if (event.type === 'order.updated' && connection.userId !== event.userId) return
    connection.io.client.emit(event.type, event)
  })
  return event
}

export function publishNftUpdated(nft: NftDetail) {
  return emitEvent(buildNftUpdatedEvent(nft))
}

export function publishOrderUpdated(order: OrderRecord) {
  return emitEvent(buildOrderUpdatedEvent(order))
}

export function dropAllConnections() {
  connections.forEach((connection) => connection.close())
}

export function dropConnectionsForToken(token: string) {
  const userId = userIdForToken(token)
  connections.forEach((connection) => {
    if (connection.userId && connection.userId === userId) connection.close()
  })
}
