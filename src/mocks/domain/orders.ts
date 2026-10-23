import type { CreateOrderRequest, Order } from '@/api/contracts'
import { defaultSettleDelayMs } from '../config'
import { randomToken, stableStringify } from '../db/crypto'
import { getDb, mutate } from '../db/store'
import type { OrderRecord, PaymentOutcome, UserRecord } from '../db/types'
import { apiError } from '../network'
import { publishNftUpdated, publishOrderUpdated } from '../realtime/server'
import { getRuntime, getScenario } from '../scenarios'
import { adjustAvailability, findNft, updateEdition } from './catalog'
import { findCart, removePurchased } from './cart'
import { computeQuote, issueQuote, quotesMatch, toQuoteResponse } from './quote'

const timers = new Map<string, ReturnType<typeof setTimeout>>()

export function toOrderResponse(record: OrderRecord): Order {
  const {
    userId: _userId,
    idempotencyKey: _key,
    requestHash: _hash,
    settleAt: _settleAt,
    outcome: _outcome,
    collector: _collector,
    cartId: _cartId,
    ...order
  } = record
  return order
}

function patchOrder(orderId: string, update: (order: OrderRecord) => void): OrderRecord | null {
  return mutate((db) => {
    const order = db.orders.find((candidate) => candidate.id === orderId)
    if (!order) return null
    update(order)
    order.version += 1
    return order
  })
}

export function settleOrder(
  orderId: string,
  outcome: 'confirmed' | 'rejected',
): OrderRecord | null {
  const current = getDb().orders.find((order) => order.id === orderId)
  if (!current || current.status !== 'pending') return current ?? null
  timers.delete(orderId)
  const settledAt = new Date().toISOString()
  if (outcome === 'confirmed') {
    const txHash = `0x${randomToken(32)}`
    const updated = patchOrder(orderId, (order) => {
      order.status = 'confirmed'
      order.txHash = txHash
      order.explorerUrl = `https://explorer.kurio.local/tx/${txHash}`
      order.settledAt = settledAt
      order.settleAt = null
    })
    if (updated) {
      removePurchased(
        updated.userId,
        updated.lines.map((line) => ({ editionId: line.editionId, quantity: line.quantity })),
      )
      publishOrderUpdated(updated)
    }
    return updated
  }
  const updated = patchOrder(orderId, (order) => {
    order.status = 'rejected'
    order.rejectionReason = 'Pagamento recusado pela carteira: saldo insuficiente na simulação.'
    order.settledAt = settledAt
    order.settleAt = null
  })
  if (updated) {
    adjustAvailability(
      updated.lines.map((line) => ({
        nftId: line.nftId,
        editionId: line.editionId,
        delta: line.quantity,
      })),
    ).forEach(publishNftUpdated)
    publishOrderUpdated(updated)
  }
  return updated
}

function scheduleSettlement(order: OrderRecord) {
  if (order.status !== 'pending' || order.settleAt === null || order.outcome === 'manual') return
  if (timers.has(order.id)) return
  const outcome = order.outcome
  const wait = Math.max(0, order.settleAt - Date.now())
  timers.set(
    order.id,
    setTimeout(() => settleOrder(order.id, outcome), wait),
  )
}

export function resumeSettlements() {
  getDb().orders.forEach(scheduleSettlement)
}

export function ensureSettled(order: OrderRecord): OrderRecord {
  if (
    order.status === 'pending' &&
    order.settleAt !== null &&
    order.outcome !== 'manual' &&
    order.settleAt <= Date.now()
  ) {
    return settleOrder(order.id, order.outcome) ?? order
  }
  return order
}

export function findUserOrder(user: UserRecord, orderId: string) {
  return getDb().orders.find((order) => order.id === orderId && order.userId === user.id)
}

type CreateResult =
  { kind: 'created' | 'replayed'; order: OrderRecord } | { kind: 'error'; response: Response }

export function createOrder(
  user: UserRecord,
  idempotencyKey: string,
  body: CreateOrderRequest,
): CreateResult {
  const requestHash = stableStringify(body)
  const db = getDb()
  const existing = db.orders.find(
    (order) => order.userId === user.id && order.idempotencyKey === idempotencyKey,
  )
  if (existing) {
    if (existing.requestHash !== requestHash) {
      return {
        kind: 'error',
        response: apiError(
          409,
          'IDEMPOTENCY_CONFLICT',
          'Esta chave de idempotência já foi usada com outro conteúdo.',
          {
            details: { orderId: existing.id },
          },
        ),
      }
    }
    return { kind: 'replayed', order: ensureSettled(existing) }
  }

  const scenario = getScenario()
  const runtime = getRuntime()
  const cart = findCart({ type: 'user', id: user.id })
  if (!cart || cart.items.length === 0) {
    return { kind: 'error', response: apiError(409, 'CONFLICT', 'Seu carrinho está vazio.') }
  }

  if (scenario.soldOutOnOrder && !runtime.soldOutFired) {
    runtime.soldOutFired = true
    const first = cart.items[0]
    if (first) {
      const updated = updateEdition(first.nftId, first.editionId, { available: 0 })
      if (updated) publishNftUpdated(updated)
    }
  }

  const connection = db.connections.find(
    (candidate) => candidate.id === body.walletConnectionId && candidate.userId === user.id,
  )
  if (!connection || connection.status !== 'connected') {
    return {
      kind: 'error',
      response: apiError(
        409,
        'CONFLICT',
        'A carteira foi desconectada. Conecte-a novamente para concluir.',
        {
          details: { reason: 'WALLET_DISCONNECTED' },
        },
      ),
    }
  }

  const ownerKey = `user:${user.id}`
  const storedQuote = db.quotes.find(
    (quote) => quote.id === body.quoteId && quote.ownerKey === ownerKey,
  )
  const fresh = computeQuote(cart, connection.network)
  const stale =
    !storedQuote ||
    Date.parse(storedQuote.expiresAt) <= Date.now() ||
    !quotesMatch(storedQuote, fresh) ||
    storedQuote.totalEth !== body.expectedTotalEth ||
    body.lines.length !== storedQuote.lines.length ||
    body.lines.some((line, index) => {
      const quoted = storedQuote.lines[index]
      return (
        !quoted ||
        quoted.editionId !== line.editionId ||
        quoted.quantity !== line.quantity ||
        quoted.unitPriceEth !== line.unitPriceEth
      )
    })

  if (stale || !fresh.purchasable) {
    const nextQuote = toQuoteResponse(issueQuote(cart, connection.network, ownerKey))
    const availabilityProblem = fresh.lines.some(
      (line) => line.status === 'sold_out' || line.status === 'insufficient',
    )
    return {
      kind: 'error',
      response: availabilityProblem
        ? apiError(
            409,
            'AVAILABILITY_CONFLICT',
            'Um ou mais itens não têm mais disponibilidade suficiente.',
            {
              details: { quote: nextQuote },
            },
          )
        : apiError(
            409,
            'QUOTE_CHANGED',
            'Preços, taxas ou cupom mudaram desde a última revisão. Confirme os novos valores.',
            {
              details: { quote: nextQuote },
            },
          ),
    }
  }

  const wallet = (db.wallets[user.id] ?? []).find(
    (candidate) => candidate.id === connection.walletId,
  )
  const outcome: PaymentOutcome = scenario.paymentOutcome
  const createdAt = Date.now()
  const order: OrderRecord = {
    id: `ord_${randomToken(6)}`,
    status: 'pending',
    lines: storedQuote.lines.map((line) => {
      const item = cart.items.find((candidate) => candidate.id === line.itemId)
      const nft = findNft(line.nftId)
      return {
        itemId: line.itemId,
        nftId: line.nftId,
        editionId: line.editionId,
        editionKind: item?.editionKind ?? '1/50',
        name: nft?.name ?? item?.name ?? line.nftId,
        tokenId: nft?.tokenId ?? item?.tokenId ?? '',
        image: nft?.image ?? item?.image ?? { alt: '', sm: '', md: '', lg: '' },
        quantity: line.quantity,
        unitPriceEth: line.unitPriceEth,
        lineTotalEth: line.lineTotalEth,
      }
    }),
    subtotalEth: storedQuote.subtotalEth,
    discountEth: storedQuote.discountEth,
    networkFeeEth: storedQuote.networkFeeEth,
    totalEth: storedQuote.totalEth,
    couponCode: storedQuote.coupon?.status === 'applied' ? storedQuote.coupon.code : null,
    network: connection.network,
    wallet: {
      id: connection.walletId,
      type: wallet?.type ?? 'metamask',
      label: wallet?.nickname ?? 'Carteira',
      address: connection.address,
    },
    txHash: null,
    explorerUrl: null,
    rejectionReason: null,
    createdAt: new Date(createdAt).toISOString(),
    settledAt: null,
    version: 1,
    userId: user.id,
    idempotencyKey,
    requestHash,
    settleAt:
      outcome === 'manual' ? null : createdAt + (scenario.settleDelayMs ?? defaultSettleDelayMs),
    outcome,
    collector: body.collector,
    cartId: cart.id,
  }

  mutate((state) => {
    state.orders.push(order)
  })
  adjustAvailability(
    order.lines.map((line) => ({
      nftId: line.nftId,
      editionId: line.editionId,
      delta: -line.quantity,
    })),
  ).forEach(publishNftUpdated)
  scheduleSettlement(order)
  return { kind: 'created', order }
}
