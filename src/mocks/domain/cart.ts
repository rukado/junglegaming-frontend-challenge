import type { Cart, CartItem } from '@/api/contracts'
import { getDb, mutate } from '../db/store'
import type { CartRecord, UserRecord } from '../db/types'
import { findNft } from './catalog'

export type CartOwner = { type: 'user'; id: string } | { type: 'guest'; id: string }

export function resolveOwner(request: Request, user: UserRecord | null): CartOwner | null {
  if (user) return { type: 'user', id: user.id }
  const guestId = request.headers.get('X-Cart-Id')
  return guestId ? { type: 'guest', id: guestId } : null
}

export function ownerKey(owner: CartOwner) {
  return `${owner.type}:${owner.id}`
}

function now() {
  return new Date().toISOString()
}

export function getOrCreateCart(owner: CartOwner): CartRecord {
  const existing = getDb().carts.find(
    (cart) => cart.ownerType === owner.type && cart.ownerId === owner.id,
  )
  if (existing) return existing
  return mutate((db) => {
    const cart: CartRecord = {
      id: `cart_${owner.type}_${owner.id}`,
      ownerType: owner.type,
      ownerId: owner.id,
      items: [],
      couponCode: null,
      updatedAt: now(),
      version: 1,
    }
    db.carts.push(cart)
    return cart
  })
}

export function findCart(owner: CartOwner): CartRecord | undefined {
  return getDb().carts.find((cart) => cart.ownerType === owner.type && cart.ownerId === owner.id)
}

function refreshLine(item: CartItem): CartItem {
  const nft = findNft(item.nftId)
  const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
  if (!nft || !edition) return { ...item, available: 0 }
  return { ...item, available: edition.available, maxPerOrder: edition.maxPerOrder }
}

export function toCartResponse(cart: CartRecord): Cart {
  return {
    id: cart.id,
    ownerType: cart.ownerType,
    items: cart.items.map(refreshLine),
    couponCode: cart.couponCode,
    updatedAt: cart.updatedAt,
    version: cart.version,
  }
}

export function saveCart(cartId: string, update: (cart: CartRecord) => void): CartRecord {
  return mutate((db) => {
    const cart = db.carts.find((candidate) => candidate.id === cartId)
    if (!cart) throw new Error('Cart not found')
    update(cart)
    cart.version += 1
    cart.updatedAt = now()
    return cart
  })
}

export type AvailabilityCheck =
  | { ok: true }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'limit'; available: number; maxPerOrder: number }

export function checkQuantity(
  nftId: string,
  editionId: string,
  quantity: number,
): AvailabilityCheck {
  const nft = findNft(nftId)
  const edition = nft?.editions.find((candidate) => candidate.id === editionId)
  if (!nft || !edition) return { ok: false, reason: 'not_found' }
  if (quantity > edition.available || quantity > edition.maxPerOrder) {
    return {
      ok: false,
      reason: 'limit',
      available: edition.available,
      maxPerOrder: edition.maxPerOrder,
    }
  }
  return { ok: true }
}

export function buildLine(nftId: string, editionId: string, quantity: number): CartItem | null {
  const nft = findNft(nftId)
  const edition = nft?.editions.find((candidate) => candidate.id === editionId)
  if (!nft || !edition) return null
  return {
    id: `line_${editionId}`,
    nftId,
    editionId,
    editionKind: edition.kind,
    name: nft.name,
    tokenId: nft.tokenId,
    image: nft.image,
    quantity,
    unitPriceEth: edition.priceEth,
    available: edition.available,
    maxPerOrder: edition.maxPerOrder,
  }
}

export function acceptChanges(cart: CartRecord): CartRecord {
  return saveCart(cart.id, (draft) => {
    draft.items = draft.items.flatMap((item) => {
      const nft = findNft(item.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
      if (!edition || edition.available === 0) return []
      const quantity = Math.min(item.quantity, edition.available, edition.maxPerOrder)
      return [{ ...item, quantity, unitPriceEth: edition.priceEth, available: edition.available }]
    })
  })
}

export function mergeCarts(guest: CartRecord, target: CartRecord): CartRecord {
  const merged = saveCart(target.id, (draft) => {
    guest.items.forEach((guestItem) => {
      const nft = findNft(guestItem.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === guestItem.editionId)
      if (!edition) return
      const limit = Math.min(edition.available, edition.maxPerOrder)
      const existing = draft.items.find((item) => item.editionId === guestItem.editionId)
      if (existing) {
        existing.quantity = Math.max(1, Math.min(existing.quantity + guestItem.quantity, limit))
      } else if (limit > 0) {
        draft.items.push({ ...guestItem, quantity: Math.min(guestItem.quantity, limit) })
      }
    })
    if (!draft.couponCode && guest.couponCode) draft.couponCode = guest.couponCode
  })
  mutate((db) => {
    db.carts = db.carts.filter((cart) => cart.id !== guest.id)
  })
  return merged
}

export function removePurchased(
  userId: string,
  lines: Array<{ editionId: string; quantity: number }>,
) {
  const cart = findCart({ type: 'user', id: userId })
  if (!cart) return
  saveCart(cart.id, (draft) => {
    draft.items = draft.items.flatMap((item) => {
      const purchased = lines.find((line) => line.editionId === item.editionId)
      if (!purchased) return [item]
      const remaining = item.quantity - purchased.quantity
      return remaining > 0 ? [{ ...item, quantity: remaining }] : []
    })
    if (draft.items.length === 0) draft.couponCode = null
  })
}
