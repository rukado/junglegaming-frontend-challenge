import type { RealtimeEvent } from '@/api/contracts'
import { getDb, mutate, resetDb } from './db/store'
import { findNft, updateEdition } from './domain/catalog'
import { resumeSettlements, settleOrder, toOrderResponse } from './domain/orders'
import {
  buildNftUpdatedEvent,
  dropAllConnections,
  emitEvent,
  getEmittedEvents,
  listConnections,
  publishNftUpdated,
  setSocketOffline,
} from './realtime/server'
import { getScenario, scenarios, setScenario } from './scenarios'

export type NftPatch = { editionId?: string; priceEth?: string; available?: number }

export const mockControl = {
  scenarios: () => scenarios.map(({ id, label, description }) => ({ id, label, description })),
  getScenario: () => getScenario().id,
  setScenario: (id: string) => setScenario(id).id,
  async reset(options: { scenario?: string } = {}) {
    dropAllConnections()
    setSocketOffline(false)
    await resetDb()
    setScenario(options.scenario ?? 'default')
    resumeSettlements()
  },
  updateNft(nftId: string, patch: NftPatch) {
    const nft = findNft(nftId)
    if (!nft) throw new Error(`NFT ${nftId} not found`)
    const editionId = patch.editionId ?? nft.editions[0]?.id
    if (!editionId) throw new Error(`NFT ${nftId} has no editions`)
    const updated = updateEdition(nftId, editionId, {
      priceEth: patch.priceEth,
      available: patch.available,
    })
    if (!updated) throw new Error(`Edition ${editionId} not found`)
    return publishNftUpdated(updated)
  },
  buildNftEvent(nftId: string) {
    const nft = findNft(nftId)
    if (!nft) throw new Error(`NFT ${nftId} not found`)
    return buildNftUpdatedEvent(nft)
  },
  emitRaw: (event: RealtimeEvent) => emitEvent(event),
  emittedEvents: () => getEmittedEvents(),
  connections: () => listConnections(),
  dropSockets: () => dropAllConnections(),
  setSocketOffline: (offline: boolean) => setSocketOffline(offline),
  settleOrder: (orderId: string, outcome: 'confirmed' | 'rejected') => {
    const order = settleOrder(orderId, outcome)
    return order ? toOrderResponse(order) : null
  },
  orders: () => getDb().orders.map(toOrderResponse),
  expireSessions: () =>
    mutate((db) => {
      db.sessions = db.sessions.map((session) => ({ ...session, expiresAt: Date.now() - 1 }))
    }),
  findNft: (nftId: string) => findNft(nftId),
}

export type MockControl = typeof mockControl

declare global {
  interface Window {
    __kurioMocks?: MockControl
  }
}
