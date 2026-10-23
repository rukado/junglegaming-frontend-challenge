import { Big } from 'big.js'
import type { NetworkId, Quote, QuoteCoupon, QuoteLine } from '@/api/contracts'
import { quoteTtlMs } from '../config'
import { randomToken } from '../db/crypto'
import { getDb, mutate } from '../db/store'
import type { CartRecord, QuoteRecord } from '../db/types'
import { findNft } from './catalog'

export const networkFees: Record<NetworkId, string> = {
  ethereum: '0.016',
  polygon: '0.004',
  solana: '0.002',
}

function resolveCoupon(
  code: string | null,
  subtotal: Big,
): { coupon: QuoteCoupon | null; discount: Big } {
  if (!code) return { coupon: null, discount: new Big(0) }
  const record = getDb().coupons.find((candidate) => candidate.code === code)
  if (!record) {
    return {
      coupon: { code, status: 'invalid', discountPercent: 0, label: 'Cupom inválido' },
      discount: new Big(0),
    }
  }
  if (record.expiresAt !== null && record.expiresAt <= Date.now()) {
    return {
      coupon: { code, status: 'expired', discountPercent: 0, label: 'Cupom expirado' },
      discount: new Big(0),
    }
  }
  return {
    coupon: { code, status: 'applied', discountPercent: record.percent, label: record.label },
    discount: subtotal.times(record.percent).div(100),
  }
}

export function computeQuote(
  cart: CartRecord,
  network: NetworkId,
): Omit<Quote, 'id' | 'issuedAt' | 'expiresAt'> {
  const lines: QuoteLine[] = cart.items.map((item) => {
    const nft = findNft(item.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
    const currentPrice = edition?.priceEth ?? item.unitPriceEth
    const available = edition?.available ?? 0
    const priceChanged = !new Big(currentPrice).eq(item.unitPriceEth)
    const status: QuoteLine['status'] =
      available === 0
        ? 'sold_out'
        : item.quantity > available
          ? 'insufficient'
          : priceChanged
            ? 'price_changed'
            : 'ok'
    return {
      itemId: item.id,
      nftId: item.nftId,
      editionId: item.editionId,
      quantity: item.quantity,
      unitPriceEth: currentPrice,
      previousUnitPriceEth: priceChanged ? item.unitPriceEth : null,
      lineTotalEth: new Big(currentPrice).times(item.quantity).toFixed(),
      available,
      status,
    }
  })
  const subtotal = lines.reduce((sum, line) => sum.plus(line.lineTotalEth), new Big(0))
  const { coupon, discount } = resolveCoupon(cart.couponCode, subtotal)
  const fee = lines.length > 0 ? new Big(networkFees[network]) : new Big(0)
  const total = subtotal.minus(discount).plus(fee)
  return {
    cartVersion: cart.version,
    network,
    lines,
    subtotalEth: subtotal.toFixed(),
    discountEth: discount.toFixed(),
    networkFeeEth: fee.toFixed(),
    totalEth: total.toFixed(),
    coupon,
    purchasable:
      lines.length > 0 &&
      lines.every((line) => line.status === 'ok') &&
      coupon?.status !== 'expired' &&
      coupon?.status !== 'invalid',
  }
}

export function issueQuote(cart: CartRecord, network: NetworkId, ownerKey: string): QuoteRecord {
  const issuedAt = Date.now()
  const record: QuoteRecord = {
    ...computeQuote(cart, network),
    id: `quote_${randomToken(8)}`,
    issuedAt: new Date(issuedAt).toISOString(),
    expiresAt: new Date(issuedAt + quoteTtlMs).toISOString(),
    ownerKey,
  }
  mutate((db) => {
    const others = db.quotes.filter((quote) => quote.ownerKey === ownerKey).slice(-4)
    db.quotes = [...db.quotes.filter((quote) => quote.ownerKey !== ownerKey), ...others, record]
  })
  return record
}

export function toQuoteResponse(record: QuoteRecord): Quote {
  const { ownerKey: _owner, ...quote } = record
  return quote
}

export function quotesMatch(
  a: Omit<Quote, 'id' | 'issuedAt' | 'expiresAt'>,
  b: Omit<Quote, 'id' | 'issuedAt' | 'expiresAt'>,
) {
  if (a.cartVersion !== b.cartVersion || a.network !== b.network) return false
  if (!new Big(a.totalEth).eq(b.totalEth) || !new Big(a.networkFeeEth).eq(b.networkFeeEth))
    return false
  if (
    (a.coupon?.code ?? null) !== (b.coupon?.code ?? null) ||
    a.coupon?.status !== b.coupon?.status
  )
    return false
  if (a.lines.length !== b.lines.length) return false
  return a.lines.every((line, index) => {
    const other = b.lines[index]
    return (
      other !== undefined &&
      other.editionId === line.editionId &&
      other.quantity === line.quantity &&
      new Big(other.unitPriceEth).eq(line.unitPriceEth) &&
      other.status === line.status
    )
  })
}
