import { buildCoupons, buildFavorites, buildUsers, buildWallets } from './fixtures/accounts'
import { buildNftFixtures } from './fixtures/nfts'
import type { MockDb } from './types'

const storageKey = 'kurio.mock.db'
const schemaVersion = 3

let db: MockDb | null = null

async function seed(): Promise<MockDb> {
  return {
    schemaVersion,
    nfts: buildNftFixtures(),
    users: await buildUsers(),
    sessions: [],
    carts: [],
    favorites: buildFavorites(),
    wallets: buildWallets(),
    connections: [],
    quotes: [],
    orders: [],
    coupons: buildCoupons(),
    eventSeq: 0,
  }
}

function load(): MockDb | null {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MockDb
    return parsed.schemaVersion === schemaVersion ? parsed : null
  } catch {
    return null
  }
}

export function persist() {
  if (!db) return
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(db))
  } catch {
    return
  }
}

export async function initDb(): Promise<MockDb> {
  db = load() ?? (await seed())
  persist()
  return db
}

export async function resetDb(): Promise<MockDb> {
  db = await seed()
  persist()
  return db
}

export function getDb(): MockDb {
  if (!db) throw new Error('Mock database not initialized')
  return db
}

export function mutate<T>(fn: (state: MockDb) => T): T {
  const result = fn(getDb())
  persist()
  return result
}

export function clearPersistedDb() {
  try {
    window.localStorage.removeItem(storageKey)
  } catch {
    return
  }
}
